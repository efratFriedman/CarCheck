import { useState } from 'react'
import { addCustomQuestion, deleteCustomQuestion, editCustomQuestion } from '../../domain/customQuestions/customQuestions'
import { getAnswer } from '../../domain/progress/progress'
import { updateAnswer } from '../../domain/answers/answers'
import type { Car, CustomQuestion } from '../../domain/types'
import { ChecklistItemCard } from './ChecklistItemCard'
import { CustomQuestionForm } from './CustomQuestionForm'

const secondaryButton = 'rounded-md border border-slate-300 bg-white px-4 py-2'

export function MyQuestions({ car, onCarChange }: { car: Car; onCarChange: (car: Car) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  return (
    <div className="space-y-3 p-3">
      {car.customQuestions.length === 0 && (
        <p className="rounded-md bg-white p-3 text-slate-700">
          עדיין לא הוספת שאלות משלך. אפשר להוסיף כאן שאלה שחשוב לך לשאול על הרכב הזה.
        </p>
      )}

      {car.customQuestions.length > 0 && (
        <ul className="space-y-3">
          {car.customQuestions.map((question) => (
            <ChecklistItemCard
              key={question.id}
              id={question.id}
              question={question.text}
              answer={getAnswer(car.answers, question.id)}
              onChange={(patch) => onCarChange(updateAnswer(car, question.id, patch))}
              header={
                <QuestionHeader
                  question={question}
                  editing={editingId === question.id}
                  deleting={deletingId === question.id}
                  onStartEdit={() => {
                    setDeletingId(null)
                    setEditingId(question.id)
                  }}
                  onSaveEdit={(text) => {
                    onCarChange(editCustomQuestion(car, question.id, text))
                    setEditingId(null)
                  }}
                  onCancelEdit={() => setEditingId(null)}
                  onStartDelete={() => {
                    setEditingId(null)
                    setDeletingId(question.id)
                  }}
                  onConfirmDelete={() => {
                    onCarChange(deleteCustomQuestion(car, question.id))
                    setDeletingId(null)
                  }}
                  onCancelDelete={() => setDeletingId(null)}
                />
              }
            />
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <CustomQuestionForm
          name="new-custom-question"
          label="שאלה חדשה"
          initialText=""
          submitLabel="הוספת שאלה"
          onSubmit={(text) => onCarChange(addCustomQuestion(car, `custom-${crypto.randomUUID()}`, text))}
        />
      </div>
    </div>
  )
}

function QuestionHeader({
  question,
  editing,
  deleting,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onStartDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  question: CustomQuestion
  editing: boolean
  deleting: boolean
  onStartEdit: () => void
  onSaveEdit: (text: string) => void
  onCancelEdit: () => void
  onStartDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}) {
  if (editing) {
    return (
      <CustomQuestionForm
        name={`${question.id}-text`}
        label="עריכת השאלה"
        initialText={question.text}
        submitLabel="שמירה"
        onSubmit={onSaveEdit}
        onCancel={onCancelEdit}
      />
    )
  }

  return (
    <div className="space-y-2">
      {deleting ? (
        <>
          <p dir="auto" className="font-medium">
            {question.text}
          </p>
          <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-red-900">
            <p className="font-medium">למחוק את השאלה? גם התשובה, ההערה והסימון שלה יימחקו.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onConfirmDelete}
                className="rounded-md bg-red-700 px-4 py-2 font-medium text-white"
              >
                כן, למחוק
              </button>
              <button type="button" onClick={onCancelDelete} className={secondaryButton}>
                ביטול
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p dir="auto" className="min-w-0 flex-1 font-medium">
            {question.text}
          </p>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={onStartEdit}
              aria-label={`עריכת השאלה: ${question.text}`}
              title="עריכת השאלה"
              className="inline-flex size-11 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onStartDelete}
              aria-label={`מחיקת השאלה: ${question.text}`}
              title="מחיקת השאלה"
              className="inline-flex size-11 items-center justify-center rounded-md text-red-700 hover:bg-red-50 hover:text-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
