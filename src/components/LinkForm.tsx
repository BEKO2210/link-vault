import { useEffect, useMemo, useState } from 'react'
import type { Category, Link } from '../types'
import { CATEGORIES } from '../types'
import { isValidUrl, parseTags, slugify, todayISO } from '../utils'
import {
  DEFAULT_GH_CONFIG,
  commitLink,
  loadGhSettings,
  saveGhSettings,
  type GhConfig,
} from '../github'

interface LinkFormProps {
  onSaveDraft: (link: Link) => void
}

type CommitState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; htmlUrl: string }
  | { status: 'error'; message: string }

export function LinkForm({ onSaveDraft }: LinkFormProps) {
  // -------- form fields --------
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('AI')
  const [tagsInput, setTagsInput] = useState('')
  const [note, setNote] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedHint, setSavedHint] = useState(false)

  // -------- github settings --------
  const [ghOwner, setGhOwner] = useState(DEFAULT_GH_CONFIG.owner)
  const [ghRepo, setGhRepo] = useState(DEFAULT_GH_CONFIG.repo)
  const [ghBranch, setGhBranch] = useState(DEFAULT_GH_CONFIG.branch)
  const [ghPath, setGhPath] = useState(DEFAULT_GH_CONFIG.path)
  const [ghToken, setGhToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [commitState, setCommitState] = useState<CommitState>({ status: 'idle' })

  // Hydrate settings once
  useEffect(() => {
    const s = loadGhSettings()
    if (s.owner) setGhOwner(s.owner)
    if (s.repo) setGhRepo(s.repo)
    if (s.branch) setGhBranch(s.branch)
    if (s.path) setGhPath(s.path)
    if (s.token) setGhToken(s.token)
  }, [])

  // Persist settings on change
  useEffect(() => {
    saveGhSettings({
      owner: ghOwner,
      repo: ghRepo,
      branch: ghBranch,
      path: ghPath,
      token: ghToken,
    })
  }, [ghOwner, ghRepo, ghBranch, ghPath, ghToken])

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
  const canCommit = canSubmit && !!ghToken && !!ghOwner && !!ghRepo

  const resetForm = () => {
    setTitle('')
    setUrl('')
    setDescription('')
    setCategory('AI')
    setTagsInput('')
    setNote('')
    setFavorite(false)
  }

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
    resetForm()
    setSavedHint(true)
    window.setTimeout(() => setSavedHint(false), 2200)
  }

  const handleCommit = async () => {
    if (!canCommit) return
    setCommitState({ status: 'loading' })
    try {
      const cfg: GhConfig = {
        owner: ghOwner.trim(),
        repo: ghRepo.trim(),
        branch: ghBranch.trim() || 'main',
        path: ghPath.trim() || 'src/data/links.json',
        token: ghToken.trim(),
      }
      const res = await commitLink(cfg, link)
      setCommitState({ status: 'success', htmlUrl: res.htmlUrl })
      resetForm()
    } catch (err) {
      setCommitState({
        status: 'error',
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return (
    <section className="form-section" id="form" aria-labelledby="form-title">
      <header className="section-head">
        <h2 id="form-title">Neuen Link vorbereiten</h2>
        <p>
          Eingaben werden live in einen JSON-Block übersetzt — kopiere ihn in{' '}
          <code>src/data/links.json</code> oder committe direkt zu GitHub.
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

          {/* GitHub direct commit ----------------------------------------- */}
          <details className="gh" open>
            <summary className="gh__summary">
              <span className="gh__summary-text">
                <span className="gh__icon" aria-hidden="true">⌥</span>
                GitHub Direkt-Commit
              </span>
              <span
                className={`gh__status ${ghToken ? 'gh__status--ok' : 'gh__status--off'}`}
                aria-hidden="true"
              >
                {ghToken ? 'Token gesetzt' : 'kein Token'}
              </span>
            </summary>

            <div className="gh__body">
              <p className="gh__hint">
                Mit einem GitHub-Token committet das Formular den neuen Eintrag direkt
                in <code>{ghPath}</code>. GitHub Pages baut die Seite automatisch neu.
                <br />
                <a
                  href="https://github.com/settings/personal-access-tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gh__link"
                >
                  Fine-grained PAT erstellen ↗
                </a>{' '}
                · Repo-Access nur für <code>{ghOwner}/{ghRepo}</code>, Permission{' '}
                <code>Contents: Read &amp; write</code>.
                <br />
                <strong>Wichtig:</strong> Token wird nur in deinem Browser gespeichert
                (<code>localStorage</code>). Niemals in geteilten oder unsicheren
                Browsern verwenden.
              </p>

              <div className="field">
                <label htmlFor="f-gh-token">GitHub Token</label>
                <div className="gh__token">
                  <input
                    id="f-gh-token"
                    type={showToken ? 'text' : 'password'}
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    placeholder="github_pat_…"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className="gh__token-toggle"
                    onClick={() => setShowToken((v) => !v)}
                    aria-label={showToken ? 'Token verbergen' : 'Token anzeigen'}
                  >
                    {showToken ? 'Verbergen' : 'Anzeigen'}
                  </button>
                  {ghToken && (
                    <button
                      type="button"
                      className="gh__token-clear"
                      onClick={() => setGhToken('')}
                      aria-label="Token entfernen"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <details className="gh__advanced">
                <summary>Erweitert · Repo-Pfad</summary>
                <div className="gh__advanced-grid">
                  <div className="field">
                    <label htmlFor="f-gh-owner">Owner</label>
                    <input
                      id="f-gh-owner"
                      type="text"
                      value={ghOwner}
                      onChange={(e) => setGhOwner(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-gh-repo">Repository</label>
                    <input
                      id="f-gh-repo"
                      type="text"
                      value={ghRepo}
                      onChange={(e) => setGhRepo(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-gh-branch">Branch</label>
                    <input
                      id="f-gh-branch"
                      type="text"
                      value={ghBranch}
                      onChange={(e) => setGhBranch(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-gh-path">Datei</label>
                    <input
                      id="f-gh-path"
                      type="text"
                      value={ghPath}
                      onChange={(e) => setGhPath(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </details>

              {commitState.status === 'success' && (
                <div className="gh__alert gh__alert--ok" role="status">
                  <strong>✓ Committed.</strong>{' '}
                  <a
                    href={commitState.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Commit auf GitHub ansehen ↗
                  </a>
                  <br />
                  GitHub Pages baut die Seite in 1–2 Minuten neu.
                </div>
              )}

              {commitState.status === 'error' && (
                <div className="gh__alert gh__alert--err" role="alert">
                  <strong>✗ Fehler:</strong> {commitState.message}
                </div>
              )}
            </div>
          </details>

          <div className="form__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleCommit}
              disabled={!canCommit || commitState.status === 'loading'}
              title={
                !ghToken
                  ? 'GitHub-Token im Bereich „GitHub Direkt-Commit" eintragen'
                  : 'Direkt zu GitHub committen'
              }
            >
              {commitState.status === 'loading'
                ? '… committe'
                : commitState.status === 'success'
                  ? '✓ Auf GitHub'
                  : 'Direkt zu GitHub committen'}
            </button>
            <button
              type="submit"
              className="btn btn--ghost"
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
            Mit Token: 1-Click-Commit in <code>{ghPath}</code>. Ohne Token: JSON
            kopieren und manuell einfügen.
          </p>
        </form>

        <pre className="code" aria-label="JSON-Vorschau" tabIndex={0}>
          <code>{json}</code>
        </pre>
      </div>
    </section>
  )
}
