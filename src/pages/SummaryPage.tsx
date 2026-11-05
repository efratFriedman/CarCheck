import { StartNewCar } from '../components/archive/StartNewCar'
import { Summary } from '../components/summary/Summary'
import { useAppData } from '../hooks/useAppData'

export function SummaryPage() {
  const { data, update } = useAppData()
  const car = data.activeCar

  if (!car) {
    return (
      <main className="mx-auto w-full max-w-xl space-y-4 p-4 sm:p-6">
        <h1 className="text-2xl font-bold">סיכום</h1>
        <p>כדי לראות סיכום, צריך קודם להזין את פרטי הרכב.</p>
        <a
          href="#/car"
          className="inline-block rounded-md bg-slate-900 px-4 py-2 font-medium text-white"
        >
          התחלת בדיקת רכב
        </a>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">סיכום</h1>
      <Summary
        mode="active"
        car={car}
        onCarChange={(next) => update({ ...data, activeCar: next })}
      />
      <section aria-label="פעולות" className="border-t border-slate-200 pt-4">
        <StartNewCar />
      </section>
    </main>
  )
}
