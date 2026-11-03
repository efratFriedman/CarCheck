import type { Route } from '../domain/routes'
import { AppDataGate } from './AppDataGate'
import { CarDetailsPage } from './CarDetailsPage'
import { Header } from './Header'
import { HomePage } from './HomePage'
import { PlaceholderPage } from './PlaceholderPage'
import { useRoute } from './useRoute'

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomePage />
    case 'car':
      return <CarDetailsPage />
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