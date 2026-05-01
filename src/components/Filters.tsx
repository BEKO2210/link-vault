import { CATEGORIES, type SortKey } from '../types'

interface FiltersProps {
  search: string
  onSearch: (s: string) => void
  category: string
  onCategory: (s: string) => void
  favOnly: boolean
  onFavOnly: (b: boolean) => void
  sort: SortKey
  onSort: (s: SortKey) => void
  categoryCounts: Map<string, number>
  totalCount: number
}

export function Filters(props: FiltersProps) {
  const {
    search,
    onSearch,
    category,
    onCategory,
    favOnly,
    onFavOnly,
    sort,
    onSort,
    categoryCounts,
    totalCount,
  } = props
  return (
    <section className="filters" aria-label="Suche und Filter">
      <div className="search">
        <span className="search__icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Suche in Titel, Beschreibung, URL, Kategorie, Tags, Notiz…"
          aria-label="Links durchsuchen"
        />
        {search && (
          <button
            type="button"
            className="search__clear"
            onClick={() => onSearch('')}
            aria-label="Suche löschen"
          >
            ×
          </button>
        )}
      </div>

      <div className="chips" role="tablist" aria-label="Kategorien">
        <button
          type="button"
          role="tab"
          aria-selected={category === 'all'}
          className={`chip ${category === 'all' ? 'chip--active' : ''}`}
          onClick={() => onCategory('all')}
        >
          Alle
          <span className="chip__count">{totalCount}</span>
        </button>
        {CATEGORIES.map((c) => {
          const count = categoryCounts.get(c) ?? 0
          if (count === 0) return null
          return (
            <button
              type="button"
              role="tab"
              key={c}
              aria-selected={category === c}
              className={`chip ${category === c ? 'chip--active' : ''}`}
              onClick={() => onCategory(c)}
            >
              {c}
              <span className="chip__count">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="filter-row">
        <label className="toggle">
          <input
            type="checkbox"
            checked={favOnly}
            onChange={(e) => onFavOnly(e.target.checked)}
          />
          <span className="toggle__pill" aria-hidden="true" />
          <span>Nur Favoriten</span>
        </label>

        <label className="select">
          <span>Sortierung</span>
          <select value={sort} onChange={(e) => onSort(e.target.value as SortKey)}>
            <option value="newest">Neueste zuerst</option>
            <option value="oldest">Älteste zuerst</option>
            <option value="az">A–Z</option>
            <option value="fav">Favoriten zuerst</option>
          </select>
        </label>
      </div>
    </section>
  )
}
