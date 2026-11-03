export type Route =
  | { name: 'home' }
  | { name: 'car' }
  | { name: 'checklist' }
  | { name: 'summary' }
  | { name: 'archive' }
  | { name: 'archivedCar'; id: string }
  | { name: 'shared'; data: string }

const simpleRoutes = {
  car: '#/car',
  checklist: '#/checklist',
  summary: '#/summary',
  archive: '#/archive',
} as const

// Unknown or malformed hashes fall back to Home.
export function parseRoute(hash: string): Route {
  const path = hash.startsWith('#') ? hash.slice(1) : hash
  const [, first, ...rest] = path.split('/')
  const tail = rest.join('/')

  switch (first) {
    case 'car':
    case 'checklist':
    case 'summary':
      return tail === '' ? { name: first } : { name: 'home' }
    case 'archive':
      if (tail === '') return { name: 'archive' }
      return rest.length === 1 ? { name: 'archivedCar', id: tail } : { name: 'home' }
    case 'shared':
      return { name: 'shared', data: tail }
    default:
      return { name: 'home' }
  }
}

export function formatRoute(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'archivedCar':
      return `#/archive/${route.id}`
    case 'shared':
      return `#/shared/${route.data}`
    default:
      return simpleRoutes[route.name]
  }
}
