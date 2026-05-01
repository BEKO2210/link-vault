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

export interface WorkflowBullet {
  text: string
  icon?: string
}

export interface WorkflowStep {
  label?: string
  code: string
  type?: 'url' | 'env' | 'cmd' | 'note'
}

export interface WorkflowSource {
  name: string
  url?: string
}

export interface Workflow {
  id: string
  title: string
  subtitle?: string
  highlights?: string[]
  bullets: WorkflowBullet[]
  steps: WorkflowStep[]
  source?: WorkflowSource
  tags: string[]
  createdAt: string
  accent?: string
}

export interface Prompt {
  id: string
  title: string
  subtitle?: string
  highlights?: string[]
  body: string
  target?: string
  useCase?: string
  source?: WorkflowSource
  tags: string[]
  createdAt: string
  accent?: string
  favorite?: boolean
}
