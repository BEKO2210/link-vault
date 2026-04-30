import type { Link } from '../types'
import { domainOf } from '../utils'

interface LinkCardProps {
  link: Link
  isDraft?: boolean
  onRemoveDraft?: (id: string) => void
}

export function LinkCard({ link, isDraft = false, onRemoveDraft }: LinkCardProps) {
  return (
    <article
      className={`card ${link.favorite ? 'card--fav' : ''} ${isDraft ? 'card--draft' : ''}`}
    >
      <header className="card__head">
        <span className="card__cat">{link.category}</span>
        <div className="card__head-right">
          {isDraft && <span className="card__badge">Lokaler Entwurf</span>}
          {link.favorite && (
            <span className="card__star" aria-label="Favorit" title="Favorit">★</span>
          )}
        </div>
      </header>

      <h3 className="card__title">{link.title}</h3>

      {link.description && <p className="card__desc">{link.description}</p>}

      {link.note && <p className="card__note">„{link.note}"</p>}

      {link.tags.length > 0 && (
        <div className="card__tags">
          {link.tags.map((t) => (
            <span className="tag" key={t}>
              #{t}
            </span>
          ))}
        </div>
      )}

      <footer className="card__foot">
        <span className="card__domain">{domainOf(link.url)}</span>
        <span className="card__date">{link.createdAt}</span>
      </footer>

      <div className="card__actions">
        <a
          className="btn btn--primary"
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Öffnen
          <span aria-hidden="true">↗</span>
        </a>
        {isDraft && onRemoveDraft && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onRemoveDraft(link.id)}
            aria-label={`Entwurf ${link.title} entfernen`}
          >
            Entwurf entfernen
          </button>
        )}
      </div>
    </article>
  )
}
