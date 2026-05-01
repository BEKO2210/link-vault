export const CATEGORIES = [
  'AI',
  'Chat',
  'Image',
  'Audio',
  'Voice',
  'Video',
  'Coding',
  'Agents',
  'MCP',
  'Memory',
  'Prompting',
  'Security',
  'Design',
  'Mobile',
  'Tool',
  'Docs',
  'Research',
  'Learning',
  'Inspiration',
  'Business',
  'GitHub',
  'Sonstiges',
] as const

export type Category = (typeof CATEGORIES)[number]

export type SortKey = 'newest' | 'oldest' | 'az' | 'fav'

export interface Link {
  id: string
  title: string
  url: string
  description: string
  categories: string[]
  tags: string[]
  note?: string
  createdAt: string
  favorite: boolean
}
