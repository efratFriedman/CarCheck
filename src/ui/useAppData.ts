import { createContext, useContext } from 'react'
import type { StoredData } from '../domain/types'

export interface AppData {
  data: StoredData
  // Replaces the stored data and saves it; a failed save is reported by the gate (D37).
  update: (next: StoredData) => void
}

export const AppDataContext = createContext<AppData | null>(null)

export function useAppData(): AppData {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData must be used inside AppDataGate')
  return value
}
