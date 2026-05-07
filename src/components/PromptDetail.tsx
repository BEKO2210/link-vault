import { useState, type CSSProperties } from 'react'
import type { Prompt, PromptBlock } from '../types'

interface PromptDetailProps {
  prompt: Prompt
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

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    return
  } catch {
    /* fall through to legacy path */
  }
  const ta = document.createElement('textarea')
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
  } catch {
    /* ignore */
  }
  ta.remove()
}

function PromptBlockCard({ index, block }: { index: number; block: PromptBlock }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    await copyText(block.body)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }
  return (
    <article className="prompt-block">
      <header className="prompt-block__head">
        <span className="prompt-block__num" aria-hidden="true">
          {String(index).padStart(2, '0')}
        </span>
        <div className="prompt-block__meta">
          <h3 className="prompt-block__title">{block.title}</h3>
          {block.intent && (
            <p className="prompt-block__intent">{block.intent}</p>
          )}
        </div>
        <button
          type="button"
          className="prompt-block__copy"
          onClick={onCopy}
          aria-label={`${block.title} kopieren`}
        >
          {copied ? '✓ Kopiert' : '⧉ Kopieren'}
        </button>
      </header>
      <pre className="prompt-block__pre">
        <code>{block.body}</code>
      </pre>
    </article>
  )
}

export function PromptDetail({ prompt, onBack }: PromptDetailProps) {
  const accent = prompt.accent ?? '#a855f7'
  const style = { '--cat-color': accent } as CSSProperties
  const [copied, setCopied] = useState(false)

  const copyAll = async () => {
    if (!prompt.body) return
    await copyText(prompt.body)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <article className="wf-detail prompt-detail" style={style}>
      <button type="button" className="btn-back" onClick={onBack}>
        ← Zurück zu Prompts
      </button>

      <header className="wf-detail__head">
        <h1 className="wf-detail__title">
          {highlightTitle(prompt.title, prompt.highlights)}
        </h1>
        {prompt.subtitle && <p className="wf-detail__sub">{prompt.subtitle}</p>}
      </header>

      {(prompt.target || prompt.useCase) && (
        <div className="prompt-meta">
          {prompt.target && (
            <div className="prompt-meta__row">
              <span className="prompt-meta__key">Target</span>
              <span className="prompt-meta__val">{prompt.target}</span>
            </div>
          )}
          {prompt.useCase && (
            <div className="prompt-meta__row">
              <span className="prompt-meta__key">Use-Case</span>
              <span className="prompt-meta__val">{prompt.useCase}</span>
            </div>
          )}
        </div>
      )}

      {prompt.blocks && prompt.blocks.length > 0 ? (
        <section className="prompt-blocks" aria-label="Prompt-Pack">
          {prompt.blocks.map((block, i) => (
            <PromptBlockCard key={i} index={i + 1} block={block} />
          ))}
        </section>
      ) : prompt.body ? (
        <section className="prompt-body" aria-labelledby="prompt-body-title">
          <header className="prompt-body__head">
            <h2 id="prompt-body-title" className="prompt-body__title">PROMPT</h2>
            <button
              type="button"
              className="prompt-body__copy"
              onClick={copyAll}
              aria-label="Prompt kopieren"
            >
              {copied ? '✓ Kopiert' : '⧉ Kopieren'}
            </button>
          </header>
          <pre className="prompt-body__pre">
            <code>{prompt.body}</code>
          </pre>
        </section>
      ) : null}

      <footer className="wf-detail__foot">
        {prompt.source && (
          <span className="wf-credit">
            <span className="wf-credit__icon" aria-hidden="true">★</span>
            {prompt.source.url ? (
              <a href={prompt.source.url} target="_blank" rel="noopener noreferrer">
                {prompt.source.name}
              </a>
            ) : (
              prompt.source.name
            )}
          </span>
        )}
        {prompt.tags.length > 0 && (
          <div className="wf-detail__tags">
            {prompt.tags.map((t) => (
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
