import { Header } from './Header'
import { PlaceholderPage } from './PlaceholderPage'
import { useRoute } from './useRoute'

export function App() {
  const route = useRoute()
  return (
    <>
      <Header />
      <PlaceholderPage route={route} />
    </>
  )
}
