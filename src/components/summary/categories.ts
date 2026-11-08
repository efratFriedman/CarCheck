import { CATEGORIES } from '../../data/checklist'
import type { SummaryCategory } from '../../domain/summary/summary'

export const CATEGORY_ORDER = CATEGORIES.map((category) => category.id)

export function categoryTitle(category: SummaryCategory): string {
  if (category === 'custom') return 'השאלות שלי'
  return CATEGORIES.find((item) => item.id === category)?.title ?? category
}
