import { useEffect, useMemo, useState } from 'react'
import linksData from './data/links.json'
import type { Link, SortKey } from './types'
import { Filters } from './components/Filters'
import { Guide } from './components/Guide'
import { Hero } from './components/Hero'
import { LinkCard } from './components/LinkCard'
import { LinkForm } from './components/LinkForm'
import { Stats } from './components/Stats'

const DRAFTS_KEY = 'blv:drafts:v1'

const baseLinks = linksData as Link[]

export function App() {
  const [drafts, setDrafts] = useState<Link[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [favOnly, setFavOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('newest')

  // Hydrate drafts from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) setDrafts(parsed as Link[])
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, [])

  const persistDrafts = (next: Link[]) => {
    setDrafts(next)
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(next))
    } catch {
      /* storage full or unavailable */
    }
  }

  const allLinks = useMemo<Link[]>(() => {
    const baseIds = new Set(baseLinks.map((l) => l.id))
    const draftsOnly = drafts.filter((d) => !baseIds.has(d.id))
    return [...baseLinks, ...draftsOnly]
  }, [drafts])

  const filtered = useMemo<Link[]>(() => {
    const q = search.trim().toLowerCase()
    let result = allLinks
    if (category !== 'all') result = result.filter((l) => l.category === category)
    if (favOnly) result = result.filter((l) => l.favorite)
    if (q) {
      result = result.filter((l) => {
        const haystack = [
          l.title,
          l.description,
          l.url,
          String(l.category),
          l.note ?? '',
          l.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    }
    const sorted = [...result]
    switch (sort) {
      case 'newest':
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        break
      case 'oldest':
        sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        break
      case 'az':
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'de'))
        break
      case 'fav':
        sorted.sort((a, b) => {
          if (a.favorite === b.favorite) return b.createdAt.localeCompare(a.createdAt)
          return a.favorite ? -1 : 1
        })
        break
    }
    return sorted
  }, [allLinks, category, favOnly, search, sort])

  const stats = useMemo(() => {
    const cats = new Set(allLinks.map((l) => l.category))
    const tags = new Set(allLinks.flatMap((l) => l.tags))
    const favs = allLinks.filter((l) => l.favorite).length
    return {
      total: allLinks.length,
      categories: cats.size,
      favorites: favs,
      tags: tags.size,
    }
  }, [allLinks])

  const isDraft = (id: string): boolean => drafts.some((d) => d.id === id)

  const saveDraft = (link: Link) => {
    const next = [...drafts.filter((d) => d.id !== link.id), link]
    persistDrafts(next)
  }

  const removeDraft = (id: string) => {
    persistDrafts(drafts.filter((d) => d.id !== id))
  }

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(allLinks, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'belkis-link-vault.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="app">
      <div className="bg-gradient" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <Hero onExport={exportAll} />

      <Stats {...stats} />

      <Filters
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        favOnly={favOnly}
        onFavOnly={setFavOnly}
        sort={sort}
        onSort={setSort}
      />

      <main className="grid" aria-live="polite">
        {filtered.length === 0 ? (
          <div className="empty">
            <p>Keine Links passen zu deinen Filtern.</p>
            <p className="empty__hint">Versuche eine andere Suche oder setze die Filter zurück.</p>
          </div>
        ) : (
          filtered.map((l) => (
            <LinkCard
              key={l.id}
              link={l}
              isDraft={isDraft(l.id)}
              onRemoveDraft={removeDraft}
            />
          ))
        )}
      </main>

      <LinkForm onSaveDraft={saveDraft} />

      <Guide />

      <footer className="footer">
        <span>Belkis Link Vault</span>
        <span className="footer__meta">
          {stats.total} Links · {stats.categories} Kategorien · {stats.favorites} Favoriten
        </span>
      </footer>
    </div>
  )
}
