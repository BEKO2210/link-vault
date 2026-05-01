import type { CSSProperties } from 'react'
import type { Workflow } from '../types'

interface WorkflowDetailProps {
  workflow: Workflow
  onBack: () => void
}

function highlightTitle(title: string, highlights?: string[]): React.ReactNode {
  if (!highlights || highlights.length === 0) return title
  const sorted = [...highlights].sort((a, b) => b.length - a.length)
  const escaped = sorted.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = title.split(re)
  return parts.map((p, i) =>
    sorted.some((h) => h.toLowerCase() === p.toLowerCase()) ? (
      <span className="wf-hl" key={i}>
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  )
}

export function WorkflowDetail({ workflow, onBack }: WorkflowDetailProps) {
  const accent = workflow.accent ?? '#ef4444'
  const style = { '--cat-color': accent } as CSSProperties

  return (
    <article className="wf-detail" style={style}>
      <button type="button" className="wf-back" onClick={onBack}>
        ← Zurück zu Workflows
      </button>

      <header className="wf-detail__head">
        <h1 className="wf-detail__title">
          {highlightTitle(workflow.title, workflow.highlights)}
        </h1>
        {workflow.subtitle && <p className="wf-detail__sub">{workflow.subtitle}</p>}
      </header>

      {workflow.bullets.length > 0 && (
        <ul className="wf-bullets">
          {workflow.bullets.map((b, i) => (
            <li className="wf-bullet" key={i}>
              {b.icon && (
                <span className="wf-bullet__icon" aria-hidden="true">
                  {b.icon}
                </span>
              )}
              <span className="wf-bullet__text">{b.text}</span>
            </li>
          ))}
        </ul>
      )}

      {workflow.steps.length > 0 && (
        <section className="wf-setup" aria-labelledby="wf-setup-title">
          <header className="wf-setup__head">
            <span className="wf-setup__bolt" aria-hidden="true">⚡</span>
            <h2 id="wf-setup-title" className="wf-setup__title">SETUP:</h2>
          </header>
          <ol className="wf-steps">
            {workflow.steps.map((s, i) => (
              <li className="wf-step" key={i}>
                <span className="wf-step__num">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="wf-step__sep" aria-hidden="true">›</span>
                <span className="wf-step__body">
                  {s.label && <span className="wf-step__label">{s.label}: </span>}
                  {s.type === 'url' ? (
                    <a
                      className="wf-step__link"
                      href={s.code}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.code}
                    </a>
                  ) : (
                    <code className="wf-step__code">{s.code}</code>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="wf-detail__foot">
        {workflow.source && (
          <span className="wf-credit">
            <span className="wf-credit__icon" aria-hidden="true">★</span>
            {workflow.source.url ? (
              <a href={workflow.source.url} target="_blank" rel="noopener noreferrer">
                {workflow.source.name}
              </a>
            ) : (
              workflow.source.name
            )}
          </span>
        )}
        {workflow.tags.length > 0 && (
          <div className="wf-detail__tags">
            {workflow.tags.map((t) => (
              <span className="tag" key={t}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </footer>
    </article>
  )
}
