import { formatNumber } from '../../domain/format/format'
import type { CarDetails } from '../../domain/types'

export function CarDetailsSummary({ details }: { details: CarDetails }) {
  const rows: [string, string | null][] = [
    ['שנת ייצור', details.year === null ? null : String(details.year)],
    ["קילומטראז'", details.mileage === null ? null : `${formatNumber(details.mileage)} ק"מ`],
    ['מחיר מבוקש', details.askingPrice === null ? null : `${formatNumber(details.askingPrice)} ₪`],
    ['מספר רישוי', details.licensePlate === '' ? null : details.licensePlate],
  ]
  const filled = rows.filter((row): row is [string, string] => row[1] !== null)

  return (
    <section aria-label="פרטי הרכב" className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 dir="auto" className="text-xl font-bold break-words">
        {details.make} {details.model}
      </h2>
      {filled.length > 0 && (
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
          {filled.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-slate-600">{label}</dt>
              <dd dir="auto" className="break-words">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
