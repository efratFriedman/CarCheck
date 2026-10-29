export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <a href="#/" className="me-auto text-lg font-bold">
          CarCheck
        </a>
        <nav aria-label="ניווט ראשי" className="flex gap-4">
          <a href="#/" className="py-1 text-slate-700 hover:underline">
            הרכב הנוכחי
          </a>
          <a href="#/archive" className="py-1 text-slate-700 hover:underline">
            רכבים קודמים
          </a>
        </nav>
      </div>
    </header>
  )
}
