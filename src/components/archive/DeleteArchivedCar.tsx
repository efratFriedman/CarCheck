import { useState } from 'react'

const secondaryButton = 'rounded-md border border-slate-300 bg-white px-4 py-2'

export function DeleteArchivedCar({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-300 bg-white px-4 py-2 font-medium text-red-700"
      >
        מחיקת הרכב
      </button>
    )
  }

  return (
    <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-red-900">
      <p className="font-medium">
        למחוק את הרכב לצמיתות? פרטי הרכב, התשובות, ההערות וההחלטה יימחקו, ואי אפשר לשחזר אותם.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-red-700 px-4 py-2 font-medium text-white"
        >
          כן, למחוק
        </button>
        <button type="button" onClick={() => setConfirming(false)} className={secondaryButton}>
          ביטול
        </button>
      </div>
    </div>
  )
}
