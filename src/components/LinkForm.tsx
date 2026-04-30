import { useMemo, useState } from 'react'
import type { Category, Link } from '../types'
import { CATEGORIES } from '../types'
import { isValidUrl, parseTags, slugify, todayISO } from '../utils'

interface LinkFormProps {
  onSaveDraft: (link: Link) => void
}

export function LinkForm({ onSaveDraft }: LinkFormProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('AI')
  const [tagsInput, setTagsInput] = useState('')
  const [note, setNote] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedHint, setSavedHint] = useState(false)

  const tags = useMemo(() => parseTags(tagsInput), [tagsInput])
  const id = useMemo(() => slugify(title) || 'neuer-link', [title])

  const urlError =
    url.length > 0 && !isValidUrl(url)
      ? 'Bitte eine gültige URL angeben (inkl. http:// oder https://).'
      : ''

  const link: Link = {
    id,
    title: title.trim(),
    url: url.trim(),
    description: description.trim(),
    category,
    tags,
    ...(note.trim() ? { note: note.trim() } : {}),
    createdAt: todayISO(),
    favorite,
  }

  const json = JSON.stringify(link, null, 2)
  const canSubmit = !!title.trim() && !!url.trim() && !urlError

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = json
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* ignore */
      }
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveDraft = () => {
    if (!canSubmit) return
    onSaveDraft(link)
    setTitle('')
    setUrl('')
    setDescription('')
    setCategory('AI')
    setTagsInput('')
    setNote('')
    setFavorite(false)
    setSavedHint(true)
    window.setTimeout(() => setSavedHint(false), 2200)
  }

  return (
    <section className="form-section" id="form" aria-labelledby="form-title">
      <header className="section-head">
        <h2 id="form-title">Neuen Link vorbereiten</h2>
        <p>
          Eingaben werden live in einen JSON-Block übersetzt — kopiere ihn in{' '}
          <code>src/data/links.json</code>.
        </p>
      </header>

      <div className="form-grid">
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            void handleCopy()
          }}
        >
          <div className="field">
            <label htmlFor="f-title">Titel</label>
            <input
              id="f-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Vercel AI SDK"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="f-url">URL</label>
            <input
              id="f-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              aria-invalid={!!urlError}
              aria-describedby={urlError ? 'f-url-error' : undefined}
              required
            />
            {urlError && (
              <span id="f-url-error" className="field__error" role="alert">
                {urlError}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="f-desc">Beschreibung</label>
            <textarea
              id="f-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Was ist das? Warum nützlich?"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="f-cat">Kategorie</label>
              <select
                id="f-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="f-tags">
                Tags <span className="hint">(Komma-getrennt)</span>
              </label>
              <input
                id="f-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="ki, tool, frontend"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="f-note">
              Persönliche Notiz <span className="hint">(optional)</span>
            </label>
            <textarea
              id="f-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Privater Hinweis für dich"
            />
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
            />
            <span>Als Favorit markieren</span>
          </label>

          <div className="form__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!canSubmit}
            >
              {copied ? '✓ Kopiert' : 'JSON kopieren'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={handleSaveDraft}
              disabled={!canSubmit}
            >
              {savedHint ? '✓ Lokal gemerkt' : 'Lokal als Entwurf merken'}
            </button>
          </div>

          <p className="hint">
            Diesen JSON-Block in <code>src/data/links.json</code> einfügen.
          </p>
        </form>

        <pre className="code" aria-label="JSON-Vorschau" tabIndex={0}>
          <code>{json}</code>
        </pre>
      </div>
    </section>
  )
}
