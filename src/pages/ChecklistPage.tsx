import { useState, type ReactNode } from 'react'
import { CATEGORIES, CHECKLIST_ITEMS } from '../data/checklist'
import { updateAnswer, updateGeneralNotes } from '../domain/answers/answers'
import { LIMITS } from '../domain/limits'
import {
  categoryProgress,
  customProgress,
  getAnswer,
  overallProgress,
  type Progress,
} from '../domain/progress/progress'
import type { Answer, Car, CategoryId } from '../domain/types'
import { ChecklistItemCard } from '../components/checklist/ChecklistItemCard'
import { MyQuestions } from '../components/checklist/MyQuestions'
import { ProgressBar, progressText } from '../components/common/ProgressBar'
import { TextArea } from '../components/common/TextArea'
import { useAppData } from '../hooks/useAppData'

const CUSTOM_CATEGORY = 'custom'
type OpenCategory = CategoryId | typeof CUSTOM_CATEGORY

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
  const [openCategory, setOpenCategory] = useState<OpenCategory | null>(CATEGORIES[0].id)
  const overall = overallProgress(CHECKLIST_ITEMS, car)
  const toggleCategory = (id: OpenCategory) => setOpenCategory(openCategory === id ? null : id)

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
        {CATEGORIES.map((category) => (
          <CategorySection
            key={category.id}
            id={category.id}
            title={category.title}
            open={openCategory === category.id}
            progress={categoryProgress(CHECKLIST_ITEMS, category.id, car.answers)}
            onToggle={() => toggleCategory(category.id)}
          >
            <ul id={`category-${category.id}`} className="space-y-3 p-3">
              {CHECKLIST_ITEMS.filter((item) => item.category === category.id).map((item) => (
                <ChecklistItemCard
                  key={item.id}
                  id={item.id}
                  question={item.question}
                  hint={item.hint}
                  answer={getAnswer(car.answers, item.id)}
                  onChange={changeAnswer(item.id)}
                />
              ))}
            </ul>
          </CategorySection>
        ))}
        <CategorySection
          id={CUSTOM_CATEGORY}
          title="השאלות שלי"
          open={openCategory === CUSTOM_CATEGORY}
          progress={customProgress(car)}
          onToggle={() => toggleCategory(CUSTOM_CATEGORY)}
        >
          <div id={`category-${CUSTOM_CATEGORY}`}>
            <MyQuestions car={car} onCarChange={onCarChange} />
          </div>
        </CategorySection>
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

function CategorySection({
  id,
  title,
  open,
  progress,
  onToggle,
  children,
}: {
  id: OpenCategory
  title: string
  open: boolean
  progress: Progress
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`category-${id}`}
          onClick={onToggle}
          className="flex min-h-14 w-full items-center justify-between gap-3 px-3 py-2 text-start"
        >
          <span className="min-w-0">
            <span className="block text-lg font-bold">{title}</span>
            <span className="block text-sm text-slate-600">{progressText(progress)}</span>
          </span>
          <span aria-hidden="true" className="shrink-0">
            {open ? '▲' : '▼'}
          </span>
        </button>
      </h2>
      <div className="px-3 pb-2">
        <ProgressBar progress={progress} label={`התקדמות: ${title}`} />
      </div>
      {open && children}
    </section>
  )
}