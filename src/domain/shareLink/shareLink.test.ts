import { afterEach, describe, expect, it, vi } from 'vitest'
import { CHECKLIST_ITEMS } from '../../data/checklist'
import { updateAnswer } from '../answers/answers'
import { createCar } from '../car/car'
import { LIMITS } from '../limits'
import { parseRoute } from '../routes/routes'
import { createSnapshot, type Snapshot } from '../snapshot/snapshot'
import type { Car } from '../types'
import {
  buildShareUrl,
  decodeSnapshot,
  encodeSnapshot,
  fromBase64Url,
  isLongShareLink,
  MAX_SNAPSHOT_BYTES,
  SHARE_LINK_WARNING_LENGTH,
  toBase64Url,
} from './shareLink'

const now = new Date('2026-11-08T08:00:00.000Z')

function typicalCar(): Car {
  const car = createCar(
    { make: 'מאזדה', model: '3', year: 2019, mileage: 85000, askingPrice: 72000, licensePlate: '12-345-67' },
    'car-1',
    new Date('2026-11-01T09:00:00.000Z'),
  )
  return {
    ...car,
    answers: {
      'history-01': { status: 'concern', note: 'תאונה קלה', followUp: true },
      'paperwork-02': { status: 'notAnswered', note: '', followUp: true },
      'custom-a': { status: 'unknown', note: '', followUp: false },
    },
    customQuestions: [{ id: 'custom-a', text: 'האם יש מפתח רזרבי?' }],
    generalNotes: 'המוכר נחמד',
    decision: { value: 'evaluating', reason: '' },
  }
}

// Every field at its limit, every built-in item answered with a full note, and 30 custom questions.
function maxCar(): Car {
  const text = (n: number) => 'אבגדה וזחט'.repeat(Math.ceil(n / 10)).slice(0, n)
  const customQuestions = Array.from({ length: 30 }, (_, i) => ({
    id: `custom-${i}`,
    text: text(LIMITS.customQuestion),
  }))
  const answers = Object.fromEntries(
    [...CHECKLIST_ITEMS.map((item) => item.id), ...customQuestions.map((q) => q.id)].map((id, i) => [
      id,
      { status: (['ok', 'concern', 'unknown'] as const)[i % 3], note: text(LIMITS.note), followUp: i % 2 === 0 },
    ]),
  )
  return {
    ...createCar(
      {
        make: text(LIMITS.make),
        model: text(LIMITS.model),
        year: 2019,
        mileage: 185000,
        askingPrice: 72000,
        licensePlate: '1'.repeat(LIMITS.licensePlate),
      },
      'car-max',
      now,
    ),
    answers,
    customQuestions,
    generalNotes: text(LIMITS.generalNotes),
    decision: { value: 'notBuying', reason: text(LIMITS.decisionReason) },
  }
}

async function encode(snapshot: Snapshot): Promise<string> {
  const result = await encodeSnapshot(snapshot)
  if (result.status !== 'ok') throw new Error('encoding failed')
  return result.data
}

async function deflate(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream('deflate'))
  return toBase64Url(new Uint8Array(await new Response(stream).arrayBuffer()))
}

const utf8 = (text: string) => new TextEncoder().encode(text)

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('base64url', () => {
  it('round-trips every byte value without +, /, or = characters', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, i) => i)
    const text = toBase64Url(bytes)
    expect(text).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(fromBase64Url(text)).toEqual(bytes)
  })

  it.each(['ab+c', 'ab/c', 'abc=', 'ab c', 'a.bc', 'abcde'])('rejects %j', (text) => {
    expect(fromBase64Url(text)).toBeNull()
  })
})

describe('encodeSnapshot and decodeSnapshot', () => {
  it('produces a versioned base64url link that decodes to the same snapshot', async () => {
    const snapshot = createSnapshot(CHECKLIST_ITEMS, typicalCar(), now)
    const data = await encode(snapshot)
    expect(data).toMatch(/^v1\.[A-Za-z0-9_-]+$/)
    expect(await decodeSnapshot(CHECKLIST_ITEMS, data)).toEqual({ status: 'ok', snapshot })
  })

  it('round-trips a car with every field at its limit and 30 custom questions', async () => {
    const snapshot = createSnapshot(CHECKLIST_ITEMS, maxCar(), now)
    expect(snapshot.items).toHaveLength(CHECKLIST_ITEMS.length + 30)
    expect(await decodeSnapshot(CHECKLIST_ITEMS, await encode(snapshot))).toEqual({ status: 'ok', snapshot })
  })

  it('keeps showing what was shared after the car is edited (AC-9.2)', async () => {
    const car = typicalCar()
    const shared = createSnapshot(CHECKLIST_ITEMS, car, now)
    const data = await encode(shared)
    const edited = updateAnswer(car, 'history-01', { status: 'ok', note: 'תוקן' })
    expect(createSnapshot(CHECKLIST_ITEMS, edited, now)).not.toEqual(shared)
    const later = await decodeSnapshot(CHECKLIST_ITEMS, data)
    expect(later).toEqual({ status: 'ok', snapshot: shared })
  })

  it('rejects a link with one character changed (AC-9.4)', async () => {
    const data = await encode(createSnapshot(CHECKLIST_ITEMS, typicalCar(), now))
    const at = 20
    const tampered = data.slice(0, at) + (data[at] === 'A' ? 'B' : 'A') + data.slice(at + 1)
    expect(await decodeSnapshot(CHECKLIST_ITEMS, tampered)).toEqual({ status: 'invalid' })
  })

  it('rejects a truncated link (AC-9.4)', async () => {
    const data = await encode(createSnapshot(CHECKLIST_ITEMS, typicalCar(), now))
    expect(await decodeSnapshot(CHECKLIST_ITEMS, data.slice(0, -12))).toEqual({ status: 'invalid' })
  })

  it.each([
    ['an empty link', ''],
    ['a link without a version', 'abc'],
    ['a version without data', 'v1.'],
    ['a malformed version', 'vx.abc'],
    ['characters outside base64url', 'v1.ab+c/d=='],
  ])('rejects %s', async (_, data) => {
    expect(await decodeSnapshot(CHECKLIST_ITEMS, data)).toEqual({ status: 'invalid' })
  })

  it.each([
    ['data that is not compressed', async () => toBase64Url(utf8('{"sharedAt":"x"}'))],
    ['compressed bytes that are not UTF-8 text', async () => deflate(Uint8Array.of(0xff, 0xfe, 0xfd))],
    ['compressed text that is not JSON', async () => deflate(utf8('not json'))],
    ['compressed JSON that is not a snapshot', async () => deflate(utf8('{"items":[]}'))],
  ])('rejects %s', async (_, payload) => {
    expect(await decodeSnapshot(CHECKLIST_ITEMS, `v1.${await payload()}`)).toEqual({ status: 'invalid' })
  })

  it('rejects a well-formed link that expands beyond the size cap, so a crafted link cannot freeze the tab', async () => {
    const car = maxCar()
    const customQuestions = Array.from({ length: 800 }, (_, i) => ({ id: `custom-big-${i}`, text: 'ש'.repeat(LIMITS.customQuestion) }))
    const answers = { ...car.answers }
    for (const q of customQuestions) answers[q.id] = { status: 'ok', note: 'ת'.repeat(LIMITS.note), followUp: false }
    const snapshot = createSnapshot(CHECKLIST_ITEMS, { ...car, customQuestions, answers }, now)
    expect(new TextEncoder().encode(JSON.stringify(snapshot)).length).toBeGreaterThan(MAX_SNAPSHOT_BYTES)
    expect(await decodeSnapshot(CHECKLIST_ITEMS, await encode(snapshot))).toEqual({ status: 'invalid' })
  })

  it.each(['v2', 'v0', 'v10'])('reports an unknown version for %s (AC-9.4)', async (version) => {
    const data = await encode(createSnapshot(CHECKLIST_ITEMS, typicalCar(), now))
    expect(await decodeSnapshot(CHECKLIST_ITEMS, data.replace(/^v1\./, `${version}.`))).toEqual({
      status: 'unknownVersion',
    })
  })

  it('reports an unsupported browser when decompression is not available', async () => {
    const data = await encode(createSnapshot(CHECKLIST_ITEMS, typicalCar(), now))
    vi.stubGlobal('DecompressionStream', undefined)
    expect(await decodeSnapshot(CHECKLIST_ITEMS, data)).toEqual({ status: 'unsupported' })
  })

  it('reports an unsupported browser when compression is not available', async () => {
    vi.stubGlobal('CompressionStream', undefined)
    expect(await encodeSnapshot(createSnapshot(CHECKLIST_ITEMS, typicalCar(), now))).toEqual({
      status: 'unsupported',
    })
  })
})

describe('buildShareUrl', () => {
  it('puts the data in the shared route of the fragment', () => {
    const url = buildShareUrl('https://my-car-check.netlify.app/', 'v1.abc_-9')
    expect(url).toBe('https://my-car-check.netlify.app/#/shared/v1.abc_-9')
    expect(parseRoute(new URL(url).hash)).toEqual({ name: 'shared', data: 'v1.abc_-9' })
  })
})

describe('isLongShareLink', () => {
  it('warns only above the threshold of 4,000 characters (OQ3)', () => {
    expect(SHARE_LINK_WARNING_LENGTH).toBe(4000)
    expect(isLongShareLink('a'.repeat(4000))).toBe(false)
    expect(isLongShareLink('a'.repeat(4001))).toBe(true)
  })
})
