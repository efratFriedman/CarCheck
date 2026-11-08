import { deleteArchivedCar, findArchivedCar } from '../domain/archive/archive'
import { formatDate } from '../domain/format/format'
import { formatRoute } from '../domain/routes/routes'
import { DeleteArchivedCar } from '../components/archive/DeleteArchivedCar'
import { Summary } from '../components/summary/Summary'
import { useAppData } from '../hooks/useAppData'

export function ArchivedCarPage({ id }: { id: string }) {
  const { data, update } = useAppData()
  const car = findArchivedCar(data, id)

  if (!car) {
    return (
      <main className="mx-auto w-full max-w-xl space-y-4 p-4 sm:p-6">
        <h1 className="text-2xl font-bold">רכב קודם</h1>
        <p>הרכב לא נמצא. ייתכן שהוא נמחק.</p>
        <a href={formatRoute({ name: 'archive' })} className="inline-flex min-h-11 items-center underline">
          לרשימת הרכבים הקודמים
        </a>
      </main>
    )
  }

  const onDelete = () => {
    update(deleteArchivedCar(data, id))
    window.location.hash = formatRoute({ name: 'archive' })
  }

  return (
    <main className="mx-auto w-full max-w-xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">רכב קודם</h1>
      <p className="text-slate-600">
        עבר לרכבים קודמים ב־{formatDate(car.archivedAt)}. מוצג לקריאה בלבד.
      </p>
      <Summary mode="archived" car={car} />
      <section aria-label="פעולות" className="border-t border-slate-200 pt-4">
        <DeleteArchivedCar onConfirm={onDelete} />
      </section>
    </main>
  )
}
