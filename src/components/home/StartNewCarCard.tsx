import { useEffect, useRef } from 'react'
import { formatRoute } from '../../domain/routes/routes'
import { START_NEW_CAR_TEXT } from '../archive/StartNewCar'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

// Same flow as StartNewCar (D50 inline confirmation); archiving happens only when the new car is saved.
export function StartNewCarCard({ onCancel }: { onCancel: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  // The card opens below the vehicle card, behind the sticky footer on small screens: bring it into view.
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
    ref.current?.scrollIntoView({ block: 'center' })
  }, [])

  return (
    <Card
      ref={ref}
      id="start-new-car"
      tabIndex={-1}
      role="alert"
      className="border-amber/50 bg-amber-soft p-4 outline-none"
    >
      <p className="font-bold">{START_NEW_CAR_TEXT.title}</p>
      <p className="mt-1 text-sm">{START_NEW_CAR_TEXT.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild>
          <a href={formatRoute({ name: 'newCar' })}>{START_NEW_CAR_TEXT.confirm}</a>
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {START_NEW_CAR_TEXT.cancel}
        </Button>
      </div>
    </Card>
  )
}
