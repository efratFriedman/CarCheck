import type { Route } from '../domain/routes/routes'
import { Header } from '../components/layout/Header'
import { useRoute } from '../hooks/useRoute'
import { ArchivedCarPage } from '../pages/ArchivedCarPage'
import { ArchivePage } from '../pages/ArchivePage'
import { CarDetailsPage } from '../pages/CarDetailsPage'
import { ChecklistPage } from '../pages/ChecklistPage'
import { HomePage } from '../pages/HomePage'
import { SharedPage } from '../pages/SharedPage'
import { SummaryPage } from '../pages/SummaryPage'
import { AppDataGate } from './AppDataGate'

// Keys make React remount a page when the route changes between two uses of the same component,
// so form state never carries over (for example from #/car to #/car/new).
function Screen({ route }: { route: Exclude<Route, { name: 'shared' }> }) {
  switch (route.name) {
    case 'home':
      return <HomePage />
    case 'car':
      return <CarDetailsPage key="car" isNew={false} />
    case 'newCar':
      return <CarDetailsPage key="newCar" isNew />
    case 'checklist':
      return <ChecklistPage />
    case 'summary':
      return <SummaryPage />
    case 'archive':
      return <ArchivePage />
    case 'archivedCar':
      return <ArchivedCarPage key={route.id} id={route.id} />
  }
}

export function App() {
  const route = useRoute()
  return (
    <>
      <Header />
      {route.name === 'shared' ? (
        <SharedPage key={route.data} data={route.data} />
      ) : (
        <AppDataGate>
          <Screen route={route} />
        </AppDataGate>
      )}
    </>
  )
}