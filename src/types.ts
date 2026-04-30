export const CATEGORIES = [
  'AI',
  'Coding',
  'Design',
  'Business',
  'Learning',
  'Tool',
  'GitHub',
  'Inspiration',
  'Prompting',
  'Research',
  'Sonstiges',
] as const

export type Category = (typeof CATEGORIES)[number]

export type SortKey = 'newest' | 'oldest' | 'az' | 'fav'

export interface Link {
  id: string
  title: string
  url: string
  description: string
  category: Category | string
  tags: string[]
  note?: string
  createdAt: string
  favorite: boolean
}
