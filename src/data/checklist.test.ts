import { describe, expect, it } from 'vitest'
import { CATEGORIES, CHECKLIST_ITEMS } from './checklist'

describe('checklist content', () => {
  it('has 25–35 items', () => {
    expect(CHECKLIST_ITEMS.length).toBeGreaterThanOrEqual(25)
    expect(CHECKLIST_ITEMS.length).toBeLessThanOrEqual(35)
  })

  it('has unique IDs in the form prefix-NN', () => {
    const ids = CHECKLIST_ITEMS.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z]+-\d{2}$/)
  })

  it('uses one ID prefix per category and a different prefix for each category', () => {
    const prefixes = new Map<string, Set<string>>()
    for (const item of CHECKLIST_ITEMS) {
      const set = prefixes.get(item.category) ?? new Set<string>()
      set.add(item.id.split('-')[0])
      prefixes.set(item.category, set)
    }
    const all = [...prefixes.values()].map((set) => [...set])
    for (const list of all) expect(list).toHaveLength(1)
    expect(new Set(all.flat()).size).toBe(all.length)
  })

  it('has non-empty Hebrew question and hint text on every item', () => {
    for (const item of CHECKLIST_ITEMS) {
      expect(item.question.trim()).not.toBe('')
      expect(item.hint.trim()).not.toBe('')
      expect(item.question).toMatch(/[\u0590-\u05FF]/)
      expect(item.hint).toMatch(/[\u0590-\u05FF]/)
    }
  })

  it('has no duplicate questions', () => {
    const questions = CHECKLIST_ITEMS.map((item) => item.question)
    expect(new Set(questions).size).toBe(questions.length)
  })

  it('lists the six categories in spec order with non-empty titles', () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual([
      'history',
      'paperwork',
      'maintenance',
      'condition',
      'testDrive',
      'inspection',
    ])
    for (const category of CATEGORIES) expect(category.title.trim()).not.toBe('')
  })

  it('has at least one item in every category and no item in an unknown category', () => {
    const categoryIds = new Set(CATEGORIES.map((c) => c.id))
    for (const category of CATEGORIES) {
      expect(CHECKLIST_ITEMS.some((item) => item.category === category.id)).toBe(true)
    }
    for (const item of CHECKLIST_ITEMS) expect(categoryIds.has(item.category)).toBe(true)
  })

  it('keeps items grouped by category in category order', () => {
    const order = CATEGORIES.map((c) => c.id)
    const indexes = CHECKLIST_ITEMS.map((item) => order.indexOf(item.category))
    expect(indexes).toEqual([...indexes].sort((a, b) => a - b))
  })
})
