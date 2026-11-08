import { useEffect, useState } from 'react'
import { CHECKLIST_ITEMS } from '../data/checklist'
import { formatDate } from '../domain/format/format'
import { formatRoute } from '../domain/routes/routes'
import { decodeSnapshot, type DecodeResult } from '../domain/shareLink/shareLink'
import { Summary } from '../components/summary/Summary'

const errorMessages: Record<Exclude<DecodeResult['status'], 'ok'>, string> = {
  invalid: 'הקישור לא תקין. ייתכן שהוא נקטע או השתנה בדרך. כדאי לבקש מהשולח קישור חדש.',
  unknownVersion: 'הקישור נוצר בגרסה אחרת של CarCheck, ואי אפשר להציג אותו כאן.',
  unsupported: 'הדפדפן הזה לא יכול להציג את הקישור. כדאי לעדכן את הדפדפן או לפתוח את הקישור בדפדפן אחר.',
}

const homeLink = 'inline-flex min-h-11 items-center underline'

// Shows a snapshot from the link only; it never reads or writes local data (FR-9.7, AC-9.5).
export function SharedPage({ data }: { data: string }) {
  const [result, setResult] = useState<DecodeResult | null>(null)

  useEffect(() => {
    let current = true
    void decodeSnapshot(CHECKLIST_ITEMS, data).then((decoded) => {
      if (current) setResult(decoded)
    })
    return () => {
      current = false
    }
  }, [data])

  return (
    <main className="mx-auto w-full max-w-xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">סיכום משותף</h1>
      {result === null && <p className="text-slate-600">טוען את הסיכום…</p>}
      {result !== null && result.status !== 'ok' && (
        <div role="alert" className="space-y-2 rounded-md border border-red-300 bg-red-50 p-3 text-red-900">
          <p className="font-medium">{errorMessages[result.status]}</p>
          <a href={formatRoute({ name: 'home' })} className={homeLink}>
            למסך הבית
          </a>
        </div>
      )}
      {result?.status === 'ok' && (
        <>
          <div className="space-y-1 rounded-md border border-slate-300 bg-slate-50 p-3">
            <p className="font-medium">תמונת מצב משותפת מ־{formatDate(result.snapshot.sharedAt)}</p>
            <p>הסיכום מוצג לקריאה בלבד, לא מתעדכן ולא נשמר במכשיר הזה.</p>
            <a href={formatRoute({ name: 'home' })} className={homeLink}>
              לפתיחת CarCheck
            </a>
          </div>
          <Summary mode="shared" snapshot={result.snapshot} />
        </>
      )}
    </main>
  )
}
