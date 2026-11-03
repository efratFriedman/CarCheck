import { CHECKLIST_ITEMS } from '../data/checklist'
import { overallProgress } from '../domain/progress'
import type { Car } from '../domain/types'
import { Disclaimer } from './Disclaimer'
import { ProgressBar, progressText } from './ProgressBar'
import { useAppData } from './useAppData'

const buttonPrimary = 'inline-block rounded-md bg-slate-900 px-4 py-2 font-medium text-white'
const buttonSecondary = 'inline-block rounded-md border border-slate-300 bg-white px-4 py-2'

export function HomePage() {
  const { data } = useAppData()
  const car = data.activeCar

  return (
    <main className="mx-auto w-full max-w-xl space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">בית</h1>
      {car ? <ActiveCarCard car={car} /> : <Welcome />}
      <p className="text-sm text-slate-600">
        הנתונים נשמרים בדפדפן במכשיר הזה בלבד. ב־Safari באייפון, אתרים שלא נפתחו כשבוע עלולים לאבד
        את הנתונים השמורים.
      </p>
    </main>
  )
}

function Welcome() {
  return (
    <>
      <p className="text-lg">
        CarCheck עוזר לארגן את המידע בזמן בדיקת רכב משומש: פרטי הרכב, שאלות לשאול את המוכר, תשובות,
        הערות ונקודות לבירור.
      </p>
      <Disclaimer />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <a href="#/car" className={buttonPrimary}>
          התחלת בדיקת רכב
        </a>
        <a href="#/archive" className="text-slate-700 underline">
          רכבים קודמים
        </a>
      </div>
    </>
  )
}

function ActiveCarCard({ car }: { car: Car }) {
  const { make, model, year } = car.details
  const progress = overallProgress(CHECKLIST_ITEMS, car.answers)
  return (
    <section aria-label="הרכב הנוכחי" className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 dir="auto" className="text-xl font-bold">
        {make} {model}
      </h2>
      {year !== null && <p className="mt-1 text-slate-600">שנת ייצור: {year}</p>}
      <div className="mt-3 space-y-1">
        <p>{progressText(progress)}</p>
        <ProgressBar progress={progress} label="התקדמות כללית" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href="#/checklist" className={buttonPrimary}>
          המשך לצ'קליסט
        </a>
        <a href="#/summary" className={buttonSecondary}>
          סיכום
        </a>
        <a href="#/car" className={buttonSecondary}>
          עריכת פרטים
        </a>
      </div>
    </section>
  )
}
