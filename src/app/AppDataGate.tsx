import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { requestPersistentStorage } from '../domain/persistentStorage/persistentStorage'
import {
  clearStoredData,
  getBrowserStorage,
  loadData,
  saveData,
  type LoadResult,
} from '../domain/storage/storage'
import type { StoredData } from '../domain/types'
import { StorageBlocked } from '../components/storage/StorageBlocked'
import { AppDataContext } from '../hooks/useAppData'

// Loads stored data once and blocks the app screens when it can't be used (D37).
// Not mounted on the shared view, which never touches local data.
export function AppDataGate({ children }: { children: ReactNode }) {
  const [storage] = useState(getBrowserStorage)
  const [load, setLoad] = useState<LoadResult>(() => loadData(storage))
  const [saveFailed, setSaveFailed] = useState(false)
  const loaded = load.status === 'ok'

  useEffect(() => {
    if (loaded) void requestPersistentStorage(navigator.storage)
  }, [loaded])

  const update = useCallback(
    (next: StoredData) => {
      setLoad({ status: 'ok', data: next })
      setSaveFailed(saveData(storage, next).status !== 'ok')
    },
    [storage],
  )

  const deleteAll = useCallback(() => {
    const result = clearStoredData(storage)
    if (result.status === 'ok') setLoad(loadData(storage))
    return result.status === 'ok'
  }, [storage])

  const value = useMemo(
    () => (load.status === 'ok' ? { data: load.data, update } : null),
    [load, update],
  )

  if (!value) {
    return (
      <StorageBlocked
        reason={load.status === 'ok' ? 'unavailable' : load.status}
        onDeleteAll={deleteAll}
      />
    )
  }

  return (
    <AppDataContext.Provider value={value}>
      {saveFailed && (
        <div role="alert" className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          <p className="mx-auto max-w-xl">
            השמירה בדפדפן נכשלה, ייתכן שהאחסון מלא. השינויים מוצגים במסך אבל לא נשמרו, והם יאבדו
            בטעינה מחדש של הדף.
          </p>
        </div>
      )}
      {children}
    </AppDataContext.Provider>
  )
}
