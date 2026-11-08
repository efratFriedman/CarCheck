import { listArchivedCars } from '../domain/archive/archive'
import { formatDate } from '../domain/format/format'
import { formatRoute } from '../domain/routes/routes'
import { DecisionBadge } from '../components/summary/DecisionBadge'
import { useAppData } from '../hooks/useAppData'

export function ArchivePage() {
  const { data } = useAppData()
  const cars = listArchivedCars(data)

  return (
    <main className="mx-auto w-full max-w-xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">רכבים קודמים</h1>
      {cars.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-slate-700">
          עדיין אין רכבים קודמים. כשמתחילים לבדוק רכב חדש, הרכב הנוכחי עובר לכאן אחרי שמירת פרטי
          הרכב החדש.
        </p>
      ) : (
        <ul className="space-y-3">
          {cars.map((car) => (
            <li key={car.id}>
              <a
                href={formatRoute({ name: 'archivedCar', id: car.id })}
                className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
              >
                <div dir="auto" className="text-lg font-bold break-words">
                  {car.details.make} {car.details.model}
                </div>
                {car.details.year !== null && (
                  <div className="text-slate-600">שנת ייצור: {car.details.year}</div>
                )}
                <div className="mt-2">
                  <DecisionBadge value={car.decision.value} />
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  עבר לרכבים קודמים ב־{formatDate(car.archivedAt)}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
