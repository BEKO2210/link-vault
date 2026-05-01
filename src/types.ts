export const CATEGORIES = [
  'AI',
  'Coding',
  'GitHub',
  'MCP',
  'Prompting',
  'Security',
  'Audio',
  'Video',
  'Design',
  'Mobile',
  'Tool',
  'Business',
  'Learning',
  'Inspiration',
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
