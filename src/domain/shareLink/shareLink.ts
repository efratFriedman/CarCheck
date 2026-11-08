import { formatRoute } from '../routes/routes'
import { validateSnapshot, type Snapshot } from '../snapshot/snapshot'
import type { ChecklistItem } from '../types'

// Link format (OQ3, D52): `v<version>.` + base64url(deflate(UTF-8 JSON)). The version stays outside the
// compressed part so a future format can still be recognized. deflate's checksum catches most tampering.
export const SHARE_VERSION = 1
export const SHARE_LINK_WARNING_LENGTH = 4000
export const MAX_SNAPSHOT_BYTES = 1_000_000

export type EncodeResult = { status: 'ok'; data: string } | { status: 'unsupported' }

export type DecodeResult =
  | { status: 'ok'; snapshot: Snapshot }
  | { status: 'invalid' }
  | { status: 'unknownVersion' }
  | { status: 'unsupported' }

export async function encodeSnapshot(snapshot: Snapshot): Promise<EncodeResult> {
  if (typeof CompressionStream === 'undefined') return { status: 'unsupported' }
  const json = new TextEncoder().encode(JSON.stringify(snapshot))
  const packed = await new Response(
    new Blob([json as BlobPart]).stream().pipeThrough(new CompressionStream('deflate')),
  ).arrayBuffer()
  return { status: 'ok', data: `v${SHARE_VERSION}.${toBase64Url(new Uint8Array(packed))}` }
}

// Never throws: every problem with the link becomes a result the shared view can explain (AC-9.4).
export async function decodeSnapshot(items: readonly ChecklistItem[], data: string): Promise<DecodeResult> {
  const match = /^v(\d+)\.(.*)$/s.exec(data)
  if (!match) return { status: 'invalid' }
  if (match[1] !== String(SHARE_VERSION)) return { status: 'unknownVersion' }
  if (typeof DecompressionStream === 'undefined') return { status: 'unsupported' }

  const packed = fromBase64Url(match[2])
  if (!packed || packed.length === 0) return { status: 'invalid' }
  try {
    const bytes = await readAll(
      new Blob([packed as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate')),
      MAX_SNAPSHOT_BYTES,
    )
    if (!bytes) return { status: 'invalid' }
    const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    return validateSnapshot(items, value) ? { status: 'ok', snapshot: value } : { status: 'invalid' }
  } catch {
    return { status: 'invalid' }
  }
}

export function buildShareUrl(base: string, data: string): string {
  return base + formatRoute({ name: 'shared', data })
}

export function isLongShareLink(url: string): boolean {
  return url.length > SHARE_LINK_WARNING_LENGTH
}

export function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64Url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text) || text.length % 4 === 1) return null
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

// Stops reading past `limit` bytes; deflate can expand about 1,000-fold, so a crafted link could
// otherwise exhaust the recipient's memory.
async function readAll(stream: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array | null> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.length
    if (size > limit) {
      await reader.cancel().catch(() => undefined)
      return null
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return bytes
}
