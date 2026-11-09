import { ChevronLeft, History } from 'lucide-react'
import { useRef, useState } from 'react'
import { CATEGORIES, CHECKLIST_ITEMS } from '../data/checklist'
import { formatNumber } from '../domain/format/format'
import { categoryOverview, overallProgress } from '../domain/progress/progress'
import { formatRoute } from '../domain/routes/routes'
import type { Car } from '../domain/types'
import { DISCLAIMER_TEXT } from '../components/common/Disclaimer'
import { CarIllustration } from '../components/home/CarIllustration'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { StartNewCarCard } from '../components/home/StartNewCarCard'
import { VehicleCard } from '../components/home/VehicleCard'
import { AppShell } from '../components/layout/AppShell'
import { HeroHeader } from '../components/layout/HeroHeader'
import { SectionTitle } from '../components/layout/SectionTitle'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAppData } from '../hooks/useAppData'

const CATEGORY_IDS = CATEGORIES.map((category) => category.id)
const NO_CAR: Pick<Car, 'answers' | 'customQuestions'> = { answers: {}, customQuestions: [] }

export function HomePage() {
  const { data } = useAppData()
  const car = data.activeCar
  const [confirmingNewCar, setConfirmingNewCar] = useState(false)
  const newCarTriggerRef = useRef<HTMLButtonElement>(null)
  const source = car ?? NO_CAR
  const progress = overallProgress(CHECKLIST_ITEMS, source)
  const overview = categoryOverview(CHECKLIST_ITEMS, CATEGORY_IDS, source)

  return (
    <AppShell
      header={
        <HeroHeader
          actions={
            <>
              {car && (
                <Button
                  ref={newCarTriggerRef}
                  variant="hero"
                  size="pill"
                  aria-expanded={confirmingNewCar}
                  aria-controls="start-new-car"
                  onClick={() => setConfirmingNewCar((open) => !open)}
                >
                  בדיקה חדשה
                </Button>
              )}
              <Button asChild variant="hero" size="icon">
                <a href={formatRoute({ name: 'archive' })} aria-label="רכבים קודמים" title="רכבים קודמים">
                  <History className="size-5" aria-hidden="true" />
                </a>
              </Button>
            </>
          }
        >
          <CarIllustration className="mx-auto mt-6 w-full max-w-sm" />
        </HeroHeader>
      }
      footer={<HomeFooter car={car} started={progress.answered > 0} />}
    >
      <div className="relative z-10 -mt-16">
        {car ? (
          <VehicleCard details={car.details} decision={car.decision.value} progress={progress} />
        ) : (
          <WelcomeCard />
        )}
      </div>

      {car && confirmingNewCar && (
        <StartNewCarCard
          onCancel={() => {
            setConfirmingNewCar(false)
            newCarTriggerRef.current?.focus()
          }}
        />
      )}

      <section aria-labelledby="home-categories" className="space-y-3">
        <SectionTitle
          id="home-categories"
          title="מה נבדוק בדרך"
          meta={`${formatNumber(CATEGORIES.length)} שלבים · ${formatNumber(progress.total)} שאלות`}
        />
        <CategoryGrid entries={overview} />
      </section>

      <div className="space-y-3 text-sm text-muted">
        <p className="rounded-card border border-border bg-surface p-4">{DISCLAIMER_TEXT}</p>
        <p>
          הנתונים נשמרים בדפדפן במכשיר הזה בלבד. ב־Safari באייפון, אתרים שלא נפתחו כשבוע עלולים לאבד
          את הנתונים השמורים.
        </p>
      </div>
    </AppShell>
  )
}

function WelcomeCard() {
  return (
    <Card className="p-5">
      <h2 className="text-2xl font-bold">ברוכים הבאים ל־CarCheck</h2>
      <p className="mt-2 text-muted">
        CarCheck עוזר לארגן את המידע בזמן בדיקת רכב משומש: פרטי הרכב, שאלות לשאול את המוכר, תשובות,
        הערות ונקודות לבירור.
      </p>
    </Card>
  )
}

function HomeFooter({ car, started }: { car: Car | null; started: boolean }) {
  const primary = car
    ? {
        href: formatRoute({ name: 'checklist' }),
        label: started ? 'המשך הבדיקה' : 'התחלת בדיקת הרכב',
      }
    : { href: formatRoute({ name: 'car' }), label: 'התחלת בדיקת רכב' }

  return (
    <>
      <div className="flex gap-3">
        <Button asChild size="lg" className="flex-1">
          <a href={primary.href}>
            {primary.label}
            <ChevronLeft className="size-5" aria-hidden="true" />
          </a>
        </Button>
        {car && (
          <Button asChild size="lg" variant="outline">
            <a href={formatRoute({ name: 'summary' })}>סיכום</a>
          </Button>
        )}
      </div>
      <p className="mt-2 text-center text-sm text-muted">ההתקדמות נשמרת במכשיר</p>
    </>
  )
}
