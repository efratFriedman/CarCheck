import { useEffect, useState } from 'react'
import { CHECKLIST_ITEMS } from '../../data/checklist'
import { formatNumber } from '../../domain/format/format'
import { buildShareUrl, encodeSnapshot, isLongShareLink } from '../../domain/shareLink/shareLink'
import { createSnapshot } from '../../domain/snapshot/snapshot'
import type { Car } from '../../domain/types'

const secondaryButton = 'rounded-md border border-slate-300 bg-white px-4 py-2'
const primaryButton = 'rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:bg-slate-400'

// The link built for one version of the car; a later edit makes it stale until it is rebuilt.
type Link = { car: Car; url: string } | { car: Car; unsupported: true }

type Result = { kind: 'copied' } | { kind: 'manual'; url: string }

// Privacy warning first (FR-9.2). The link is built in memory while the warning is open, so the
// confirm tap can open the share sheet directly; cancelling discards it (D53).
export function ShareButton({ car }: { car: Car }) {
  const [open, setOpen] = useState(false)
  const [link, setLink] = useState<Link | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    if (!open) return
    let current = true
    void encodeSnapshot(createSnapshot(CHECKLIST_ITEMS, car, new Date())).then((encoded) => {
      if (!current) return
      setLink(
        encoded.status === 'ok'
          ? { car, url: buildShareUrl(window.location.origin + window.location.pathname, encoded.data) }
          : { car, unsupported: true },
      )
    })
    return () => {
      current = false
    }
  }, [open, car])

  const close = () => {
    setOpen(false)
    setLink(null)
  }

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setResult({ kind: 'copied' })
    } catch {
      setResult({ kind: 'manual', url })
    }
  }

  const share = (url: string) => {
    close()
    if (typeof navigator.share !== 'function') {
      void copy(url)
      return
    }
    const { make, model } = car.details
    navigator.share({ title: `סיכום רכב: ${make} ${model}`, url }).then(
      () => setResult(null),
      (error: unknown) => {
        // Closing the share sheet is a cancel, not a failure.
        if (error instanceof Error && error.name === 'AbortError') return
        void copy(url)
      },
    )
  }

  if (!open) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            setResult(null)
            setOpen(true)
          }}
          className={secondaryButton}
        >
          שיתוף
        </button>
        {result?.kind === 'copied' && (
          <p role="status" className="font-medium">
            הקישור הועתק
          </p>
        )}
        {result?.kind === 'manual' && <ManualLink url={result.url} onClose={() => setResult(null)} />}
      </div>
    )
  }

  const ready = link !== null && link.car === car ? link : null
  const url = ready && 'url' in ready ? ready.url : null

  return (
    <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-950">
      <p className="font-medium">לפני השיתוף</p>
      <ul className="mt-1 list-disc space-y-1 ps-5">
        <li>הקישור כולל את כל פרטי הרכב, התשובות וההערות.</li>
        <li>כל מי שיקבל את הקישור יוכל לקרוא אותם.</li>
        <li>זו תמונת מצב: שינויים שיתבצעו ברכב אחרי השיתוף לא יופיעו בקישור.</li>
      </ul>
      {url !== null && isLongShareLink(url) && (
        <p className="mt-2">
          הקישור ארוך ({formatNumber(url.length)} תווים), ויש אפליקציות שעלולות לקטוע אותו. אפשר לשתף
          בכל זאת.
        </p>
      )}
      {ready && 'unsupported' in ready && (
        <p className="mt-2 font-medium">הדפדפן הזה לא יכול ליצור קישור שיתוף. אפשר לנסות בדפדפן מעודכן.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-3">
        {!(ready && 'unsupported' in ready) && (
          <button
            type="button"
            disabled={url === null}
            onClick={() => url !== null && share(url)}
            className={primaryButton}
          >
            {url === null ? 'מכין קישור…' : 'שיתוף הקישור'}
          </button>
        )}
        <button type="button" onClick={close} className={secondaryButton}>
          ביטול
        </button>
      </div>
    </div>
  )
}

// Last fallback (FR-9.5): the link in a read-only field the user can select and copy.
function ManualLink({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="space-y-2 rounded-md border border-slate-300 bg-slate-50 p-3">
      <label htmlFor="share-link" className="block font-medium">
        הקישור לשיתוף
      </label>
      <p className="text-sm text-slate-600">ההעתקה האוטומטית לא הצליחה. אפשר לסמן את הקישור ולהעתיק אותו.</p>
      <textarea
        id="share-link"
        readOnly
        dir="ltr"
        rows={3}
        value={url}
        onFocus={(event) => event.currentTarget.select()}
        className="w-full rounded-md border border-slate-300 bg-white p-2 font-mono text-sm break-all"
      />
      <button type="button" onClick={onClose} className={secondaryButton}>
        סגירה
      </button>
    </div>
  )
}
