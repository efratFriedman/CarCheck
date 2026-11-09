import { useState, type FormEvent } from 'react'
import { startNewCar } from '../domain/archive/archive'
import { detailsToInput, updateCarDetails } from '../domain/car/car'
import {
  validateCarDetails,
  type CarDetailsInput,
} from '../domain/carDetails/carDetails'
import { formatRoute } from '../domain/routes/routes'
import { carDetailsErrorMessage } from '../components/car/carDetailsMessages'
import { TextField } from '../components/common/TextField'
import { useAppData } from '../hooks/useAppData'

const FIELD_ORDER: (keyof CarDetailsInput)[] = [
  'make',
  'model',
  'year',
  'mileage',
  'askingPrice',
  'licensePlate',
]

// `isNew` (#/car/new) starts an empty form for a new car; saving it archives the current car (D06).
export function CarDetailsPage({ isNew }: { isNew: boolean }) {
  const { data, update } = useAppData()
  const activeCar = data.activeCar
  const editing = isNew ? null : activeCar
  const [input, setInput] = useState<CarDetailsInput>(() => detailsToInput(editing?.details ?? null))
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
    update(
      editing
        ? { ...data, activeCar: updateCarDetails(editing, result.details) }
        : startNewCar(data, result.details, crypto.randomUUID(), submittedAt),
    )
    window.location.hash = formatRoute({ name: 'home' })
  }

  return (
    <main className="mx-auto w-full max-w-xl p-4 sm:p-6">
      <h1 className="text-2xl font-bold">פרטי הרכב</h1>
      {isNew && activeCar && (
        <p className="mt-2 rounded-md border border-slate-300 bg-slate-50 p-3">
          אחרי השמירה,{' '}
          <bdi>
            {activeCar.details.make} {activeCar.details.model}
          </bdi>{' '}
          יעבור לרכבים קודמים. ביטול משאיר אותו כרכב הנוכחי.
        </p>
      )}
      <form noValidate onSubmit={onSubmit} className="mt-4 space-y-4">
        <TextField name="make" label="יצרן" required value={input.make} error={message('make')} onChange={set('make')} />
        <TextField name="model" label="דגם" required value={input.model} error={message('model')} onChange={set('model')} />
        <TextField name="year" label="שנת ייצור" numeric value={input.year} error={message('year')} onChange={set('year')} />
        <TextField name="hand" label="יד" value={input.hand} error={message('hand')} onChange={set('hand')} />
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
