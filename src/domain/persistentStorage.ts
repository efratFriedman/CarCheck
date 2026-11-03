export interface PersistentStorageManager {
  persist?: () => Promise<boolean>
}

// Best effort (D35): a refusal or a missing API is not an error.
export async function requestPersistentStorage(
  manager: PersistentStorageManager | undefined,
): Promise<boolean> {
  try {
    return (await manager?.persist?.()) ?? false
  } catch {
    return false
  }
}
