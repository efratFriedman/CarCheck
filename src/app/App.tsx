import type { Route } from '../domain/routes/routes'
import { Header } from '../components/layout/Header'
import { useRoute } from '../hooks/useRoute'
import { CarDetailsPage } from '../pages/CarDetailsPage'
import { ChecklistPage } from '../pages/ChecklistPage'
import { HomePage } from '../pages/HomePage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { AppDataGate } from './AppDataGate'

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomePage />
    case 'car':
      return <CarDetailsPage />
    case 'checklist':
      return <ChecklistPage />
    default:
      return <PlaceholderPage route={route} />
  }
}

export function App() {
  const route = useRoute()
  return (
    <>
      <Header />
      {route.name === 'shared' ? (
        <PlaceholderPage route={route} />
      ) : (
        <AppDataGate>
          <Screen route={route} />
        </AppDataGate>
      )}
    </>
  )
}