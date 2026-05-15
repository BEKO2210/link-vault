import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import linksData from './data/links.json'
import workflowsData from './data/workflows.json'
import promptsData from './data/prompts.json'
import type { Link, Prompt, SortKey, Workflow } from './types'
import { Filters } from './components/Filters'
import { Hero } from './components/Hero'
import { HomeNav } from './components/HomeNav'
import { LinkCard } from './components/LinkCard'
import { PromptCard } from './components/PromptCard'
import { Stats } from './components/Stats'
import { WorkflowCard } from './components/WorkflowCard'
import { shuffled } from './utils'

const WorkflowDetail = lazy(() =>
  import('./components/WorkflowDetail').then((m) => ({ default: m.WorkflowDetail })),
)
const PromptDetail = lazy(() =>
  import('./components/PromptDetail').then((m) => ({ default: m.PromptDetail })),
)

const Spinner = (
  <div className="loading" role="status" aria-label="Lädt">
    <span className="loading__dot" />
    <span className="loading__dot" />
    <span className="loading__dot" />
  </div>
)

const DRAFTS_KEY = 'blv:drafts:v1'
const PREVIEW_LIMIT = 5

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

function validateLinks(arr: unknown): Link[] {
  if (!Array.isArray(arr)) return []
  return arr
    .map(migrateDraft)
    .filter((l): l is Link => l !== null)
}

function validateWorkflows(arr: unknown): Workflow[] {
  if (!Array.isArray(arr)) return []
  return arr.flatMap((w): Workflow[] => {
    if (!w || typeof w !== 'object') return []
    const o = w as Record<string, unknown>
    if (
      typeof o.id !== 'string' ||
      typeof o.title !== 'string' ||
      !Array.isArray(o.bullets) ||
      !Array.isArray(o.steps) ||
      !isStringArray(o.tags) ||
      typeof o.createdAt !== 'string'
    ) {
      return []
    }
    return [w as Workflow]
  })
}

function validatePrompts(arr: unknown): Prompt[] {
  if (!Array.isArray(arr)) return []
  return arr.flatMap((p): Prompt[] => {
    if (!p || typeof p !== 'object') return []
    const o = p as Record<string, unknown>
    const hasBody = typeof o.body === 'string'
    const hasBlocks = Array.isArray(o.blocks) && o.blocks.length > 0
    if (
      typeof o.id !== 'string' ||
      typeof o.title !== 'string' ||
      (!hasBody && !hasBlocks) ||
      !isStringArray(o.tags) ||
      typeof o.createdAt !== 'string'
    ) {
      return []
    }
    return [p as Prompt]
  })
}

const baseLinks = validateLinks(linksData)
const workflows = validateWorkflows(workflowsData)
const prompts = validatePrompts(promptsData)

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
  const [category, setCategory] = useState<string>('random')
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

  // Keyboard shortcuts: "/" focuses search, "Esc" clears it,
  // "g h/l/w/p" navigates between pages.
  useEffect(() => {
    let gPending: number | null = null
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const inEditable =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if (e.key === 'Escape' && inEditable && target instanceof HTMLInputElement) {
        if (target.type === 'search') {
          setSearch('')
          target.blur()
          e.preventDefault()
        }
        return
      }

      if (inEditable || e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === '/') {
        if (route.name !== 'links') {
          window.location.hash = '#/links'
        }
        e.preventDefault()
        window.requestAnimationFrame(() => {
          const search =
            document.querySelector<HTMLInputElement>('input[type="search"]')
          search?.focus()
        })
        return
      }

      if (e.key === 'g') {
        if (gPending) window.clearTimeout(gPending)
        gPending = window.setTimeout(() => {
          gPending = null
        }, 800)
        return
      }

      if (gPending) {
        window.clearTimeout(gPending)
        gPending = null
        if (e.key === 'h') window.location.hash = '#/'
        else if (e.key === 'l') window.location.hash = '#/links'
        else if (e.key === 'w') window.location.hash = '#/workflows'
        else if (e.key === 'p') window.location.hash = '#/prompts'
        else return
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [route.name])

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
    if (category !== 'all' && category !== 'random') {
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

  const showRandom = category === 'random' && search.trim() === ''

  const discover = useMemo<Link[]>(() => {
    if (!showRandom) return []
    return shuffled(filtered, shuffleSeed).slice(0, PREVIEW_LIMIT)
  }, [filtered, shuffleSeed, showRandom])

  const isDraft = (id: string): boolean => drafts.some((d) => d.id === id)

  const removeDraft = (id: string) => {
    persistDrafts(drafts.filter((d) => d.id !== id))
  }

  const activeWorkflow =
    route.name === 'workflow' ? workflows.find((w) => w.id === route.id) : undefined
  const activePrompt =
    route.name === 'prompt' ? prompts.find((p) => p.id === route.id) : undefined

  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)
  }

  const exportCurrent = () => {
    switch (route.name) {
      case 'links':
        return downloadJson(allLinks, 'belkis-links.json')
      case 'workflows':
        return downloadJson(workflows, 'belkis-workflows.json')
      case 'workflow':
        return activeWorkflow
          ? downloadJson(activeWorkflow, `workflow-${activeWorkflow.id}.json`)
          : undefined
      case 'prompts':
        return downloadJson(prompts, 'belkis-prompts.json')
      case 'prompt':
        return activePrompt
          ? downloadJson(activePrompt, `prompt-${activePrompt.id}.json`)
          : undefined
      default:
        return downloadJson(
          { links: allLinks, workflows, prompts },
          'belkis-vault.json',
        )
    }
  }

  const exportLabel = (() => {
    switch (route.name) {
      case 'links':
        return 'Links JSON'
      case 'workflows':
        return 'Workflows JSON'
      case 'workflow':
        return 'Workflow JSON'
      case 'prompts':
        return 'Prompts JSON'
      case 'prompt':
        return 'Prompt JSON'
      default:
        return 'Alles JSON'
    }
  })()

  return (
    <div className="app">
      <div className="bg-gradient" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <Hero
        onExport={exportCurrent}
        exportLabel={exportLabel}
        compact={route.name !== 'home'}
      />

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
            className="btn-back"
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

          <main id="main" aria-live="polite">
            {filtered.length === 0 ? (
              <div className="empty">
                <p>Keine Links passen zu deinen Filtern.</p>
                <p className="empty__hint">Versuche eine andere Suche oder setze die Filter zurück.</p>
              </div>
            ) : showRandom ? (
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
            ) : (
              <section aria-labelledby="results-title">
                <header className="discover__head">
                  <h2 id="results-title" className="discover__title">
                    {category === 'all' ? 'Alle Links' : category}
                  </h2>
                  <span className="discover__count">{filtered.length}</span>
                </header>
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
              </section>
            )}
          </main>
        </>
      )}

      {route.name === 'workflows' && (
        <>
          <button
            type="button"
            className="btn-back"
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
            <Suspense fallback={Spinner}>
              <WorkflowDetail
                workflow={activeWorkflow}
                onBack={() => navigate({ name: 'workflows' })}
              />
            </Suspense>
          ) : (
            <div className="empty">
              <p>Workflow nicht gefunden.</p>
              <button
                type="button"
                className="btn-back"
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
            className="btn-back"
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
            <Suspense fallback={Spinner}>
              <PromptDetail
                prompt={activePrompt}
                onBack={() => navigate({ name: 'prompts' })}
              />
            </Suspense>
          ) : (
            <div className="empty">
              <p>Prompt nicht gefunden.</p>
              <button
                type="button"
                className="btn-back"
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
