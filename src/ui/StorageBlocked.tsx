import { useState } from 'react'

export type BlockedReason = 'corrupt' | 'unknownVersion' | 'unavailable'

const messages: Record<BlockedReason, { title: string; body: string }> = {
  corrupt: {
    title: 'לא ניתן לקרוא את הנתונים השמורים',
    body: 'הנתונים השמורים בדפדפן פגומים. הם לא נמחקו ולא שונו. אפשר למחוק אותם ולהתחיל מחדש.',
  },
  unknownVersion: {
    title: 'הנתונים השמורים נוצרו בגרסה אחרת',
    body: 'הנתונים השמורים בדפדפן נוצרו בגרסה לא מוכרת של CarCheck. הם לא נמחקו ולא שונו. אפשר למחוק אותם ולהתחיל מחדש.',
  },
  unavailable: {
    title: 'האחסון בדפדפן אינו זמין',
    body: 'CarCheck שומר את הנתונים בדפדפן, והאחסון אינו זמין כרגע. ייתכן שהדפדפן במצב גלישה פרטית או שהאחסון חסום. קישורים משותפים עדיין נפתחים כרגיל.',
  },
}

export function StorageBlocked({
  reason,
  onDeleteAll,
}: {
  reason: BlockedReason
  onDeleteAll: () => boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const [failed, setFailed] = useState(false)
  const { title, body } = messages[reason]

  return (
    <main className="mx-auto w-full max-w-xl p-4 sm:p-6">
      <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-2">{body}</p>
        {failed && <p className="mt-2 font-medium">מחיקת הנתונים נכשלה.</p>}
        {reason !== 'unavailable' &&
          (confirming ? (
            <div className="mt-4">
              <p className="font-medium">
                כל הנתונים השמורים, כולל הרכב הנוכחי ורכבים קודמים, יימחקו לצמיתות. להמשיך?
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-md bg-red-700 px-4 py-2 font-medium text-white"
                  onClick={() => {
                    if (!onDeleteAll()) {
                      setFailed(true)
                      setConfirming(false)
                    }
                  }}
                >
                  כן, למחוק הכול
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-300 bg-white px-4 py-2"
                  onClick={() => setConfirming(false)}
                >
                  ביטול
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="mt-4 rounded-md bg-red-700 px-4 py-2 font-medium text-white"
              onClick={() => setConfirming(true)}
            >
              מחיקת הנתונים והתחלה מחדש
            </button>
          ))}
      </div>
    </main>
  )
}
