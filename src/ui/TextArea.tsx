import { formatNumber } from '../domain/format'

export function TextArea({
  name,
  label,
  value,
  maxLength,
  rows = 3,
  onChange,
}: {
  name: string
  label: string
  value: string
  maxLength: number
  rows?: number
  onChange: (value: string) => void
}) {
  const counterId = `${name}-counter`
  return (
    <div>
      <label htmlFor={name} className="block font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        dir="auto"
        rows={rows}
        maxLength={maxLength}
        value={value}
        aria-describedby={counterId}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2"
      />
      <p id={counterId} className="mt-1 text-sm text-slate-600">
        {formatNumber(value.length)} מתוך {formatNumber(maxLength)} תווים
      </p>
    </div>
  )
}
