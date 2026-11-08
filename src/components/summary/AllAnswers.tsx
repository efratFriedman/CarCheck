import { useState } from 'react'
import { formatNumber } from '../../domain/format/format'
import type { CategoryAnswers } from '../../domain/summary/summary'
import { categoryTitle } from './categories'
import { EntryList } from './EntryList'

export function AllAnswers({ groups }: { groups: readonly CategoryAnswers[] }) {
  const [open, setOpen] = useState(false)
  const count = groups.reduce((sum, group) => sum + group.entries.length, 0)

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="all-answers"
          onClick={() => setOpen(!open)}
          className="flex min-h-14 w-full items-center justify-between gap-3 px-3 py-2 text-start"
        >
          <span className="text-lg font-bold">
            כל התשובות לפי קטגוריה ({formatNumber(count)})
          </span>
          <span aria-hidden="true" className="shrink-0">
            {open ? '▲' : '▼'}
          </span>
        </button>
      </h2>
      {open && (
        <div id="all-answers" className="space-y-4 px-3 pb-3">
          {groups.length === 0 ? (
            <p className="text-slate-600">עדיין אין תשובות.</p>
          ) : (
            groups.map((group) => (
              <section key={group.category} className="space-y-2">
                <h3 className="font-bold">{categoryTitle(group.category)}</h3>
                <EntryList entries={group.entries} empty="" showStatus showFlag />
              </section>
            ))
          )}
        </div>
      )}
    </section>
  )
}
