import { describe, expect, it } from 'vitest'
import { formatRoute, parseRoute, type Route } from './routes'

describe('parseRoute', () => {
  it.each([
    ['', { name: 'home' }],
    ['#', { name: 'home' }],
    ['#/', { name: 'home' }],
    ['#/car', { name: 'car' }],
    ['#/car/', { name: 'car' }],
    ['#/checklist', { name: 'checklist' }],
    ['#/summary', { name: 'summary' }],
    ['#/archive', { name: 'archive' }],
    ['#/archive/', { name: 'archive' }],
    ['#/archive/abc-1', { name: 'archivedCar', id: 'abc-1' }],
    ['#/shared/AbC_-9', { name: 'shared', data: 'AbC_-9' }],
    ['#/shared', { name: 'shared', data: '' }],
  ] satisfies [string, Route][])('parses %j', (hash, route) => {
    expect(parseRoute(hash)).toEqual(route)
  })

  it.each(['#/nope', '#/car/extra', '#/archive/a/b', '#checklist', '#/Checklist', '#//'])(
    'sends unknown route %j to Home',
    (hash) => {
      expect(parseRoute(hash)).toEqual({ name: 'home' })
    },
  )
})

describe('formatRoute', () => {
  it.each<Route>([
    { name: 'home' },
    { name: 'car' },
    { name: 'checklist' },
    { name: 'summary' },
    { name: 'archive' },
    { name: 'archivedCar', id: 'abc-1' },
    { name: 'shared', data: 'AbC_-9' },
  ])('round-trips %j', (route) => {
    expect(parseRoute(formatRoute(route))).toEqual(route)
  })
})
