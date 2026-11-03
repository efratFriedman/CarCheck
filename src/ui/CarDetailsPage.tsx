import { useState, type FormEvent } from 'react'
import { createCar, detailsToInput, updateCarDetails } from '../domain/car'
import {
  validateCarDetails,
  type CarDetailsInput,
} from '../domain/carDetails'
import { formatRoute } from '../domain/routes'
import { carDetailsErrorMessage } from './carDetailsMessages'
import { TextField } from './TextField'
import { useAppData } from './useAppData'

const FIELD_ORDER: (keyof CarDetailsInput)[] = [
  'make',
  'model',
  'year',
  'mileage',
  'askingPrice',
  'licensePlate',
]

export function CarDetailsPage() {
  const { data, update } = useAppData()
  const activeCar = data.activeCar
  const [input, setInput] = useState<CarDetailsInput>(() => detailsToInput(activeCar?.details ?? null))
  const [errors, setErrors] = useState<Partial<Record<keyof CarDetailsInput, string>>>({})

  const set = (field: keyof CarDetailsInput) => (value: string) =>
    setInput((current) => ({ ...current, [field]: value }))
  const message = (field: keyof CarDetailsInput) => errors[field]

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submittedAt = new Date()
    const result = validateCarDetails(input, submittedAt)
    if (!result.ok) {
      const messages: typeof errors = {}
      for (const field of FIELD_ORDER) {
        const error = result.errors[field]
        if (error) messages[field] = carDetailsErrorMessage(field, error, submittedAt)
      }
      setErrors(messages)
      const first = FIELD_ORDER.find((field) => result.errors[field])
      if (first) document.getElementById(first)?.focus()
      return
    }
    const car = activeCar
      ? updateCarDetails(activeCar, result.details)
      : createCar(result.details, crypto.randomUUID(), submittedAt)
    update({ ...data, activeCar: car })
    window.location.hash = formatRoute({ name: 'home' })
  }

  return (
    <main className="mx-auto w-full max-w-xl p-4 sm:p-6">
      <h1 className="text-2xl font-bold">פרטי הרכב</h1>
      <form noValidate onSubmit={onSubmit} className="mt-4 space-y-4">
        <TextField name="make" label="יצרן" required value={input.make} error={message('make')} onChange={set('make')} />
        <TextField name="model" label="דגם" required value={input.model} error={message('model')} onChange={set('model')} />
        <TextField name="year" label="שנת ייצור" numeric value={input.year} error={message('year')} onChange={set('year')} />
        <TextField name="mileage" label="קילומטראז'" numeric value={input.mileage} error={message('mileage')} onChange={set('mileage')} />
        <TextField name="askingPrice" label="מחיר מבוקש (₪)" numeric value={input.askingPrice} error={message('askingPrice')} onChange={set('askingPrice')} />
        <TextField name="licensePlate" label="מספר רישוי" value={input.licensePlate} error={message('licensePlate')} onChange={set('licensePlate')} />
        <p className="text-sm text-slate-600">שדות המסומנים ב־* הם שדות חובה.</p>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white">
            שמירה
          </button>
          <a href="#/" className="rounded-md border border-slate-300 bg-white px-4 py-2">
            ביטול
          </a>
        </div>
      </form>
    </main>
  )
}
