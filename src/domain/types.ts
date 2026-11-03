export const SCHEMA_VERSION = 1

export type Status = 'notAnswered' | 'ok' | 'concern' | 'unknown'

export type DecisionValue = 'evaluating' | 'movingForward' | 'notBuying'

export type CategoryId =
  | 'history'
  | 'paperwork'
  | 'maintenance'
  | 'condition'
  | 'testDrive'
  | 'inspection'

export interface ChecklistItem {
  id: string
  category: CategoryId
  question: string
  hint: string
}

export interface CarDetails {
  make: string
  model: string
  year: number | null
  mileage: number | null
  askingPrice: number | null
  licensePlate: string
}

export interface Answer {
  status: Status
  note: string
  followUp: boolean
}

export interface CustomQuestion {
  id: string
  text: string
}

export interface Decision {
  value: DecisionValue
  reason: string
}

export interface Car {
  id: string
  details: CarDetails
  // Keyed by built-in item ID or custom question ID. A missing key means "not answered".
  answers: Record<string, Answer>
  customQuestions: CustomQuestion[]
  generalNotes: string
  decision: Decision
  createdAt: string
}

export interface ArchivedCar extends Car {
  archivedAt: string
}

export interface StoredData {
  version: typeof SCHEMA_VERSION
  activeCar: Car | null
  archivedCars: ArchivedCar[]
}
