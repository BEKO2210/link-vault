export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 64)
}

export function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function shuffled<T>(arr: readonly T[], seed: number): T[] {
  const out = arr.slice()
  let s = (seed | 0) || 1
  for (let i = out.length - 1; i > 0; i--) {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    const j = Math.abs(s) % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const CATEGORY_COLORS: Record<string, string> = {
  AI: '#ef4444',
  Chat: '#f59e0b',
  Image: '#ec4899',
  Audio: '#a855f7',
  Voice: '#c084fc',
  Video: '#8b5cf6',
  Coding: '#22d3ee',
  Agents: '#0ea5e9',
  MCP: '#06b6d4',
  Memory: '#14b8a6',
  Prompting: '#f97316',
  Security: '#dc2626',
  Design: '#f0abfc',
  Mobile: '#10b981',
  Tool: '#94a3b8',
  Docs: '#6366f1',
  Research: '#84cc16',
  Learning: '#22c55e',
  Inspiration: '#fb7185',
  Business: '#eab308',
  GitHub: '#9ca3af',
  Sonstiges: '#71717a',
}

export function colorOf(category: string): string {
  return CATEGORY_COLORS[category] ?? '#71717a'
}
