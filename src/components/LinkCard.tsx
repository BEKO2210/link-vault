import type { CSSProperties } from 'react'
import type { Link } from '../types'
import { colorOf, domainOf } from '../utils'

interface LinkCardProps {
  link: Link
  isDraft?: boolean
  onRemoveDraft?: (id: string) => void
}

export function LinkCard({ link, isDraft = false, onRemoveDraft }: LinkCardProps) {
  const cats = link.categories?.length ? link.categories : ['Sonstiges']
  const primary = cats[0] ?? 'Sonstiges'
  const accent = colorOf(primary)
  const domain = domainOf(link.url)

  const style = {
    '--cat-color': accent,
  } as CSSProperties

  return (
    <article
      className={`card ${link.favorite ? 'card--fav' : ''} ${isDraft ? 'card--draft' : ''}`}
      style={style}
    >
      <a
        className="card__link"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${link.title} öffnen — ${domain}`}
      >
        <span className="visually-hidden">{link.title} öffnen</span>
      </a>

      <header className="card__head">
        <span className="card__domain">{domain}</span>
        <div className="card__head-right">
          {isDraft && <span className="card__badge">Entwurf</span>}
          {link.favorite && (
            <span className="card__star" aria-label="Favorit" title="Favorit">★</span>
          )}
        </div>
      </header>

      <h3 className="card__title">{link.title}</h3>

      {link.description && <p className="card__desc">{link.description}</p>}

      {link.note && <p className="card__note">„{link.note}"</p>}

      <div className="card__cats">
        {cats.map((c, i) => (
          <span
            key={c}
            className={`card__cat ${i === 0 ? 'card__cat--primary' : ''}`}
            style={i === 0 ? { background: `${colorOf(c)}22`, color: colorOf(c), borderColor: `${colorOf(c)}55` } : undefined}
          >
            {c}
          </span>
        ))}
      </div>

      {link.tags.length > 0 && (
        <div className="card__tags">
          {link.tags.slice(0, 5).map((t) => (
            <span className="tag" key={t}>
              #{t}
            </span>
          ))}
        </div>
      )}

      <footer className="card__foot">
        <span className="card__date">{link.createdAt}</span>
        <span className="card__open" aria-hidden="true">↗</span>
      </footer>

      {isDraft && onRemoveDraft && (
        <button
          type="button"
          className="card__remove"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemoveDraft(link.id)
          }}
          aria-label={`Entwurf ${link.title} entfernen`}
          title="Entwurf entfernen"
        >
          ×
        </button>
      )}
    </article>
  )
}
