import { useState } from 'react'
import { formatRoute } from '../../domain/routes/routes'

export const START_NEW_CAR_TEXT = {
  title: 'להתחיל לבדוק רכב חדש?',
  body: 'הרכב הנוכחי יעבור לרכבים קודמים רק אחרי שמירת פרטי הרכב החדש. שם אפשר לצפות בו, אבל לא לערוך אותו.',
  confirm: 'כן, לפרטי הרכב החדש',
  cancel: 'ביטול',
} as const

const secondaryButton = 'rounded-md border border-slate-300 bg-white px-4 py-2'

// Confirms before opening the new car form; archiving happens only when that form is saved (D06).
export function StartNewCar() {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={secondaryButton}>
        התחלת רכב חדש
      </button>
    )
  }

  return (
    <div role="alert" className="rounded-md border border-slate-300 bg-slate-50 p-3">
      <p className="font-medium">{START_NEW_CAR_TEXT.title}</p>
      <p className="mt-1">{START_NEW_CAR_TEXT.body}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <a
          href={formatRoute({ name: 'newCar' })}
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white"
        >
          {START_NEW_CAR_TEXT.confirm}
        </a>
        <button type="button" onClick={() => setConfirming(false)} className={secondaryButton}>
          {START_NEW_CAR_TEXT.cancel}
        </button>
      </div>
    </div>
  )
}
