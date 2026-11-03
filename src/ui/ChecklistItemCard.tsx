import { useState } from 'react'
import { LIMITS } from '../domain/limits'
import type { Answer, ChecklistItem } from '../domain/types'
import { STATUS_OPTIONS } from './statusOptions'
import { TextArea } from './TextArea'

export function ChecklistItemCard({
  item,
  answer,
  onChange,
}: {
  item: ChecklistItem
  answer: Answer
  onChange: (patch: Partial<Answer>) => void
}) {
  const [hintOpen, setHintOpen] = useState(false)
  const hintId = `${item.id}-hint`

  return (
    <li className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
      <p dir="auto" className="font-medium">
        {item.question}
      </p>

      <div>
        <button
          type="button"
          aria-expanded={hintOpen}
          aria-controls={hintId}
          onClick={() => setHintOpen((open) => !open)}
          className="text-sm text-slate-700 underline"
        >
          למה זה חשוב?
        </button>
        {hintOpen && (
          <p id={hintId} className="mt-2 rounded-md bg-slate-50 p-2 text-sm text-slate-700">
            {item.hint}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="sr-only">סטטוס</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STATUS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-center has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-slate-900"
            >
              <input
                type="radio"
                name={`${item.id}-status`}
                value={option.value}
                checked={answer.status === option.value}
                onChange={() => onChange({ status: option.value })}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <TextArea
        name={`${item.id}-note`}
        label="הערה"
        value={answer.note}
        maxLength={LIMITS.note}
        onChange={(note) => onChange({ note })}
      />

      <label className="flex min-h-11 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={answer.followUp}
          onChange={(event) => onChange({ followUp: event.target.checked })}
          className="size-5"
        />
        דורש בירור
      </label>
    </li>
  )
}
