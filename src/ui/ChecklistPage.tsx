import { useState } from 'react'
import { CATEGORIES, CHECKLIST_ITEMS } from '../data/checklist'
import { updateAnswer, updateGeneralNotes } from '../domain/answers'
import { LIMITS } from '../domain/limits'
import { categoryProgress, getAnswer, overallProgress } from '../domain/progress'
import type { Answer, Car, CategoryId } from '../domain/types'
import { ChecklistItemCard } from './ChecklistItemCard'
import { ProgressBar, progressText } from './ProgressBar'
import { TextArea } from './TextArea'
import { useAppData } from './useAppData'

export function ChecklistPage() {
  const { data, update } = useAppData()
  const car = data.activeCar

  if (!car) {
    return (
      <main className="mx-auto w-full max-w-xl space-y-4 p-4 sm:p-6">
        <h1 className="text-2xl font-bold">צ'קליסט</h1>
        <p>כדי להתחיל למלא את הצ'קליסט, צריך קודם להזין את פרטי הרכב.</p>
        <a
          href="#/car"
          className="inline-block rounded-md bg-slate-900 px-4 py-2 font-medium text-white"
        >
          התחלת בדיקת רכב
        </a>
      </main>
    )
  }

  return <ChecklistContent car={car} onCarChange={(next) => update({ ...data, activeCar: next })} />
}

function ChecklistContent({ car, onCarChange }: { car: Car; onCarChange: (car: Car) => void }) {
  const [openCategory, setOpenCategory] = useState<CategoryId | null>(CATEGORIES[0].id)
  const overall = overallProgress(CHECKLIST_ITEMS, car.answers)

  const changeAnswer = (id: string) => (patch: Partial<Answer>) =>
    onCarChange(updateAnswer(car, id, patch))

  return (
    <main className="mx-auto w-full max-w-xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">צ'קליסט</h1>
      <p dir="auto" className="text-slate-600">
        {car.details.make} {car.details.model}
      </p>

      <section aria-label="התקדמות כללית" className="space-y-1">
        <p className="font-medium">{progressText(overall)}</p>
        <ProgressBar progress={overall} label="התקדמות כללית" />
      </section>

      <div className="space-y-3">
        {CATEGORIES.map((category) => {
          const open = openCategory === category.id
          const progress = categoryProgress(CHECKLIST_ITEMS, category.id, car.answers)
          const panelId = `category-${category.id}`
          return (
            <section key={category.id} className="rounded-lg border border-slate-200 bg-slate-50">
              <h2>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenCategory(open ? null : category.id)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-3 py-2 text-start"
                >
                  <span className="min-w-0">
                    <span className="block text-lg font-bold">{category.title}</span>
                    <span className="block text-sm text-slate-600">{progressText(progress)}</span>
                  </span>
                  <span aria-hidden="true" className="shrink-0">
                    {open ? '▲' : '▼'}
                  </span>
                </button>
              </h2>
              <div className="px-3 pb-2">
                <ProgressBar progress={progress} label={`התקדמות: ${category.title}`} />
              </div>
              {open && (
                <ul id={panelId} className="space-y-3 p-3">
                  {CHECKLIST_ITEMS.filter((item) => item.category === category.id).map((item) => (
                    <ChecklistItemCard
                      key={item.id}
                      item={item}
                      answer={getAnswer(car.answers, item.id)}
                      onChange={changeAnswer(item.id)}
                    />
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      <section className="pt-2">
        <TextArea
          name="generalNotes"
          label="הערות כלליות על הרכב"
          value={car.generalNotes}
          maxLength={LIMITS.generalNotes}
          rows={5}
          onChange={(notes) => onCarChange(updateGeneralNotes(car, notes))}
        />
      </section>
    </main>
  )
}
