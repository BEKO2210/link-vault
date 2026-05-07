import type { CSSProperties } from 'react'
import type { Prompt } from '../types'

interface PromptCardProps {
  prompt: Prompt
  onOpen: (id: string) => void
}

export function PromptCard({ prompt, onOpen }: PromptCardProps) {
  const accent = prompt.accent ?? '#a855f7'
  const style = { '--cat-color': accent } as CSSProperties
  const blockCount = prompt.blocks?.length ?? 0
  const charCount = prompt.body
    ? prompt.body.length
    : (prompt.blocks ?? []).reduce((sum, b) => sum + b.body.length, 0)
  return (
    <article className="wf-card" style={style}>
      <button
        type="button"
        className="wf-card__btn"
        onClick={() => onOpen(prompt.id)}
        aria-label={`${prompt.title} öffnen`}
      >
        <header className="wf-card__head">
          <span className="wf-card__date">{prompt.createdAt}</span>
          {prompt.favorite && (
            <span className="card__star" aria-label="Favorit" title="Favorit">★</span>
          )}
        </header>

        <h3 className="wf-card__title">{prompt.title}</h3>

        {prompt.subtitle && <p className="wf-card__sub">{prompt.subtitle}</p>}

        {prompt.target && (
          <p className="prompt-card__target">
            <span className="prompt-card__target-label">für</span> {prompt.target}
          </p>
        )}

        <footer className="wf-card__foot">
          <span className="wf-card__meta">
            {blockCount > 0
              ? `${blockCount} Prompts · ${charCount.toLocaleString('de-DE')} Zeichen`
              : `${charCount.toLocaleString('de-DE')} Zeichen`}
          </span>
          <span className="wf-card__cta" aria-hidden="true">→</span>
        </footer>

        {prompt.tags.length > 0 && (
          <div className="wf-card__tags">
            {prompt.tags.slice(0, 4).map((t) => (
              <span className="tag" key={t}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </button>
    </article>
  )
}
