export function TextField({
  name,
  label,
  value,
  error,
  required,
  numeric,
  hint,
  onChange,
}: {
  name: string
  label: string
  value: string
  error?: string
  required?: boolean
  numeric?: boolean
  hint?: string
  onChange: (value: string) => void
}) {
  const errorId = `${name}-error`
  const hintId = `${name}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div>
      <label htmlFor={name} className="block font-medium">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        dir="auto"
        inputMode={numeric ? 'numeric' : undefined}
        autoComplete="off"
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 ${
          error ? 'border-red-600' : 'border-slate-300'
        }`}
      />
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
