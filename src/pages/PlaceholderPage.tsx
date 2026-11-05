// Stands in for the shared view until session 10.
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto w-full max-w-xl p-4 sm:p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-600">העמוד בבנייה.</p>
    </main>
  )
}
