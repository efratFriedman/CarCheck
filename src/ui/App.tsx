import { formatNumber } from '../domain/format'

export function App() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">CarCheck – בדיקת רכב משומש</h1>
      <p className="mt-2 text-slate-600">
        האפליקציה בבנייה. דוגמה לעיצוב מספרים: {formatNumber(1234567)}
      </p>
    </main>
  )
}
