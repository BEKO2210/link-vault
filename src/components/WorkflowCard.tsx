import type { CSSProperties } from 'react'
import type { Workflow } from '../types'

interface WorkflowCardProps {
  workflow: Workflow
  onOpen: (id: string) => void
}

export function WorkflowCard({ workflow, onOpen }: WorkflowCardProps) {
  const accent = workflow.accent ?? '#ef4444'
  const style = { '--cat-color': accent } as CSSProperties
  return (
    <article className="wf-card" style={style}>
      <button
        type="button"
        className="wf-card__btn"
        onClick={() => onOpen(workflow.id)}
        aria-label={`${workflow.title} öffnen`}
      >
        <header className="wf-card__head">
          <span className="wf-card__date">{workflow.createdAt}</span>
          {workflow.source && (
            <span className="wf-card__source">{workflow.source.name}</span>
          )}
        </header>

        <h3 className="wf-card__title">{workflow.title}</h3>

        {workflow.subtitle && <p className="wf-card__sub">{workflow.subtitle}</p>}

        <footer className="wf-card__foot">
          <span className="wf-card__meta">
            {workflow.bullets.length} Punkte · {workflow.steps.length} Schritte
          </span>
          <span className="wf-card__cta" aria-hidden="true">→</span>
        </footer>

        {workflow.tags.length > 0 && (
          <div className="wf-card__tags">
            {workflow.tags.slice(0, 4).map((t) => (
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
