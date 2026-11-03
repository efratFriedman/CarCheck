import { describe, expect, it, vi } from 'vitest'
import { requestPersistentStorage } from './persistentStorage'

describe('requestPersistentStorage', () => {
  it('returns the browser answer', async () => {
    expect(await requestPersistentStorage({ persist: vi.fn().mockResolvedValue(true) })).toBe(true)
    expect(await requestPersistentStorage({ persist: vi.fn().mockResolvedValue(false) })).toBe(false)
  })

  it('returns false when the API is missing', async () => {
    expect(await requestPersistentStorage(undefined)).toBe(false)
    expect(await requestPersistentStorage({})).toBe(false)
  })

  it('returns false when the request rejects or throws', async () => {
    expect(await requestPersistentStorage({ persist: vi.fn().mockRejectedValue(new Error('x')) })).toBe(false)
    expect(
      await requestPersistentStorage({
        persist: () => {
          throw new Error('x')
        },
      }),
    ).toBe(false)
  })
})
