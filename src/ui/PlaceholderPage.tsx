import type { Route } from '../domain/routes'

const titles: Record<Route['name'], string> = {
  home: 'בית',
  car: 'פרטי הרכב',
  checklist: "צ'קליסט",
  summary: 'סיכום',
  archive: 'רכבים קודמים',
  archivedCar: 'רכב קודם',
  shared: 'סיכום משותף',
}

export function PlaceholderPage({ route }: { route: Route }) {
  return (
    <main className="mx-auto w-full max-w-xl p-4 sm:p-6">
      <h1 className="text-2xl font-bold">{titles[route.name]}</h1>
      <p className="mt-2 text-slate-600">העמוד בבנייה.</p>
    </main>
  )
}
