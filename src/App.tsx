import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import linksData from './data/links.json'
import workflowsData from './data/workflows.json'
import promptsData from './data/prompts.json'
import { CATEGORIES, type Link, type Prompt, type SortKey, type Workflow } from './types'
import { Filters } from './components/Filters'
import { Hero } from './components/Hero'
import { HomeNav } from './components/HomeNav'
import { LinkCard } from './components/LinkCard'
import { LinkForm } from './components/LinkForm'
import { PromptCard } from './components/PromptCard'
import { PromptDetail } from './components/PromptDetail'
import { Stats } from './components/Stats'
import { WorkflowCard } from './components/WorkflowCard'
import { WorkflowDetail } from './components/WorkflowDetail'
import { colorOf, shuffled } from './utils'

const DRAFTS_KEY = 'blv:drafts:v1'
const PREVIEW_LIMIT = 5

const baseLinks = linksData as Link[]
const workflows = workflowsData as Workflow[]
const prompts = promptsData as Prompt[]

function categoriesOf(link: Link): string[] {
  return Array.isArray(link.categories) && link.categories.length > 0
    ? link.categories
    : ['Sonstiges']
}

function migrateDraft(d: unknown): Link | null {
  if (!d || typeof d !== 'object') return null
  const o = d as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.title !== 'string' || typeof o.url !== 'string') {
    return null
  }
  let categories: string[]
  if (Array.isArray(o.categories) && o.categories.every((c) => typeof c === 'string')) {
    categories = o.categories as string[]
  } else if (typeof o.category === 'string') {
    categories = [o.category]
  } else {
    categories = ['Sonstiges']
  }
  return {
    id: o.id,
    title: o.title,
    url: o.url,
    description: typeof o.description === 'string' ? o.description : '',
    categories,
    tags: Array.isArray(o.tags) ? (o.tags.filter((t) => typeof t === 'string') as string[]) : [],
    note: typeof o.note === 'string' ? o.note : undefined,
    createdAt: typeof o.createdAt === 'string' ? o.createdAt : '',
    favorite: o.favorite === true,
  }
}

type Route =
  | { name: 'home' }
  | { name: 'links' }
  | { name: 'workflows' }
  | { name: 'workflow'; id: string }
  | { name: 'prompts' }
  | { name: 'prompt'; id: string }

function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '').replace(/\/$/, '')
  if (h === '' || h === '/') return { name: 'home' }
  if (h === 'links') return { name: 'links' }
  if (h === 'workflows') return { name: 'workflows' }
  if (h === 'prompts') return { name: 'prompts' }
  const wfMatch = h.match(/^workflows\/(.+)$/)
  if (wfMatch && wfMatch[1]) return { name: 'workflow', id: wfMatch[1] }
  const pMatch = h.match(/^prompts\/(.+)$/)
  if (pMatch && pMatch[1]) return { name: 'prompt', id: pMatch[1] }
  return { name: 'home' }
}

function routeToHash(r: Route): string {
  if (r.name === 'home') return '#/'
  if (r.name === 'links') return '#/links'
  if (r.name === 'workflows') return '#/workflows'
  if (r.name === 'prompts') return '#/prompts'
  if (r.name === 'workflow') return `#/workflows/${r.id}`
  return `#/prompts/${r.id}`
}

export function App() {
  const [drafts, setDrafts] = useState<Link[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [favOnly, setFavOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('newest')
  const [shuffleSeed, setShuffleSeed] = useState<number>(
    () => Math.floor(Math.random() * 1e9) + 1,
  )
  const [route, setRoute] = useState<Route>(() =>
    typeof window === 'undefined' ? { name: 'home' } : parseHash(window.location.hash),
  )

  // Hash-routing
  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const navigate = (r: Route) => {
    if (typeof window !== 'undefined') {
      const hash = routeToHash(r)
      if (window.location.hash !== hash) {
        window.location.hash = hash
      } else {
        setRoute(r)
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Drafts hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const migrated = parsed
            .map(migrateDraft)
            .filter((d): d is Link => d !== null)
          setDrafts(migrated)
        }
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
    if (category !== 'all') {
      result = result.filter((l) => categoriesOf(l).includes(category))
    }
    if (favOnly) result = result.filter((l) => l.favorite)
    if (q) {
      result = result.filter((l) => {
        const haystack = [
          l.title,
          l.description,
          l.url,
          categoriesOf(l).join(' '),
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
    const cats = new Set<string>()
    for (const l of allLinks) for (const c of categoriesOf(l)) cats.add(c)
    const tags = new Set(allLinks.flatMap((l) => l.tags))
    const favs = allLinks.filter((l) => l.favorite).length
    return {
      total: allLinks.length,
      categories: cats.size,
      favorites: favs,
      tags: tags.size,
    }
  }, [allLinks])

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const l of allLinks) {
      for (const c of categoriesOf(l)) counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    return counts
  }, [allLinks])

  const isAllView = category === 'all' && search.trim() === '' && !favOnly

  const discover = useMemo<Link[]>(() => {
    if (!isAllView) return []
    return shuffled(filtered, shuffleSeed).slice(0, PREVIEW_LIMIT)
  }, [filtered, shuffleSeed, isAllView])

  const orderedCats = useMemo<string[]>(() => {
    const used = new Set<string>()
    for (const l of allLinks) for (const c of categoriesOf(l)) used.add(c)
    const out: string[] = []
    for (const c of CATEGORIES) if (used.has(c)) out.push(c)
    for (const c of used) if (!out.includes(c)) out.push(c)
    return out
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

  const activeWorkflow =
    route.name === 'workflow' ? workflows.find((w) => w.id === route.id) : undefined
  const activePrompt =
    route.name === 'prompt' ? prompts.find((p) => p.id === route.id) : undefined

  return (
    <div className="app">
      <div className="bg-gradient" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <Hero onExport={exportAll} compact={route.name !== 'home'} />

      {route.name === 'home' && (
        <>
          <HomeNav
            linkCount={stats.total}
            workflowCount={workflows.length}
            promptCount={prompts.length}
            onGoLinks={() => navigate({ name: 'links' })}
            onGoWorkflows={() => navigate({ name: 'workflows' })}
            onGoPrompts={() => navigate({ name: 'prompts' })}
          />
          <Stats {...stats} />
        </>
      )}

      {route.name === 'links' && (
        <>
          <button
            type="button"
            className="back-link"
            onClick={() => navigate({ name: 'home' })}
          >
            ← Startseite
          </button>

          <Filters
            search={search}
            onSearch={setSearch}
            category={category}
            onCategory={setCategory}
            favOnly={favOnly}
            onFavOnly={setFavOnly}
            sort={sort}
            onSort={setSort}
            categoryCounts={categoryCounts}
            totalCount={allLinks.length}
          />

          <main aria-live="polite">
            {filtered.length === 0 ? (
              <div className="empty">
                <p>Keine Links passen zu deinen Filtern.</p>
                <p className="empty__hint">Versuche eine andere Suche oder setze die Filter zurück.</p>
              </div>
            ) : isAllView ? (
              <>
                <section className="discover" aria-labelledby="discover-title">
                  <header className="discover__head">
                    <h2 id="discover-title" className="discover__title">
                      Heute zufällig
                    </h2>
                    <span className="discover__count">
                      {discover.length} von {filtered.length}
                    </span>
                    <button
                      type="button"
                      className="discover__shuffle"
                      onClick={() =>
                        setShuffleSeed(Math.floor(Math.random() * 1e9) + 1)
                      }
                      aria-label="Neu mischen"
                    >
                      ↻ Neu mischen
                    </button>
                  </header>
                  <div className="grid">
                    {discover.map((l) => (
                      <LinkCard
                        key={l.id}
                        link={l}
                        isDraft={isDraft(l.id)}
                        onRemoveDraft={removeDraft}
                      />
                    ))}
                  </div>
                </section>

                <section className="cat-tiles-section" aria-labelledby="cats-title">
                  <header className="cat-tiles-section__head">
                    <h2 id="cats-title" className="cat-tiles-section__title">
                      Kategorien
                    </h2>
                    <span className="cat-tiles-section__count">
                      {orderedCats.length}
                    </span>
                  </header>
                  <div className="cat-tiles">
                    {orderedCats.map((c) => {
                      const count = categoryCounts.get(c) ?? 0
                      const tileStyle = { '--cat-color': colorOf(c) } as CSSProperties
                      return (
                        <button
                          type="button"
                          key={c}
                          className="cat-tile"
                          style={tileStyle}
                          onClick={() => {
                            setCategory(c)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          aria-label={`${c} — ${count} Links anzeigen`}
                        >
                          <span className="cat-tile__dot" aria-hidden="true" />
                          <span className="cat-tile__name">{c}</span>
                          <span className="cat-tile__count">{count}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              </>
            ) : (
              <div className="grid">
                {filtered.map((l) => (
                  <LinkCard
                    key={l.id}
                    link={l}
                    isDraft={isDraft(l.id)}
                    onRemoveDraft={removeDraft}
                  />
                ))}
              </div>
            )}
          </main>

          <LinkForm onSaveDraft={saveDraft} />
        </>
      )}

      {route.name === 'workflows' && (
        <>
          <button
            type="button"
            className="back-link"
            onClick={() => navigate({ name: 'home' })}
          >
            ← Startseite
          </button>

          <section className="wf-list" aria-labelledby="wf-list-title">
            <header className="discover__head">
              <h2 id="wf-list-title" className="discover__title">Workflows</h2>
              <span className="discover__count">{workflows.length}</span>
            </header>
            {workflows.length === 0 ? (
              <div className="empty">
                <p>Noch keine Workflows.</p>
              </div>
            ) : (
              <div className="grid">
                {workflows.map((w) => (
                  <WorkflowCard
                    key={w.id}
                    workflow={w}
                    onOpen={(id) => navigate({ name: 'workflow', id })}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {route.name === 'workflow' && (
        <>
          {activeWorkflow ? (
            <WorkflowDetail
              workflow={activeWorkflow}
              onBack={() => navigate({ name: 'workflows' })}
            />
          ) : (
            <div className="empty">
              <p>Workflow nicht gefunden.</p>
              <button
                type="button"
                className="back-link"
                onClick={() => navigate({ name: 'workflows' })}
              >
                ← Zurück
              </button>
            </div>
          )}
        </>
      )}

      {route.name === 'prompts' && (
        <>
          <button
            type="button"
            className="back-link"
            onClick={() => navigate({ name: 'home' })}
          >
            ← Startseite
          </button>

          <section className="wf-list" aria-labelledby="prompts-list-title">
            <header className="discover__head">
              <h2 id="prompts-list-title" className="discover__title">Prompts</h2>
              <span className="discover__count">{prompts.length}</span>
            </header>
            {prompts.length === 0 ? (
              <div className="empty">
                <p>Noch keine Prompts.</p>
              </div>
            ) : (
              <div className="grid">
                {prompts.map((p) => (
                  <PromptCard
                    key={p.id}
                    prompt={p}
                    onOpen={(id) => navigate({ name: 'prompt', id })}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {route.name === 'prompt' && (
        <>
          {activePrompt ? (
            <PromptDetail
              prompt={activePrompt}
              onBack={() => navigate({ name: 'prompts' })}
            />
          ) : (
            <div className="empty">
              <p>Prompt nicht gefunden.</p>
              <button
                type="button"
                className="back-link"
                onClick={() => navigate({ name: 'prompts' })}
              >
                ← Zurück
              </button>
            </div>
          )}
        </>
      )}

      <footer className="footer">
        <span>Belkis Link Vault</span>
        <span className="footer__meta">
          {stats.total} Links · {workflows.length} {workflows.length === 1 ? 'Workflow' : 'Workflows'} · {prompts.length} {prompts.length === 1 ? 'Prompt' : 'Prompts'}
        </span>
      </footer>
    </div>
  )
}
