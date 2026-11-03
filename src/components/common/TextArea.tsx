import { formatNumber } from '../../domain/format/format'

export function TextArea({
  name,
  label,
  value,
  maxLength,
  rows = 3,
  error,
  onChange,
}: {
  name: string
  label: string
  value: string
  maxLength: number
  rows?: number
  error?: string
  onChange: (value: string) => void
}) {
  const counterId = `${name}-counter`
  const errorId = `${name}-error`
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
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${errorId} ${counterId}` : counterId}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 ${
          error ? 'border-red-600' : 'border-slate-300'
        }`}
      />
      <p id={counterId} className="mt-1 text-sm text-slate-600">
        {formatNumber(value.length)} מתוך {formatNumber(maxLength)} תווים
      </p>
      {error && (
        <p id={errorId} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
