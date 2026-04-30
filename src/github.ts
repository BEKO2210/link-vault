import type { Link } from './types'

export interface GhConfig {
  owner: string
  repo: string
  branch: string
  path: string
  token: string
}

export interface CommitResult {
  htmlUrl: string
  sha: string
}

export const DEFAULT_GH_CONFIG: Omit<GhConfig, 'token'> = {
  owner: 'BEKO2210',
  repo: 'link-vault',
  branch: 'main',
  path: 'src/data/links.json',
}

const SETTINGS_KEY = 'blv:gh_settings:v1'

// We persist owner/repo/branch/path locally; token is also kept here so the
// user enters it once. localStorage is per-origin — fine for a personal vault,
// but the form clearly warns about that.
export function loadGhSettings(): Partial<GhConfig> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<GhConfig>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveGhSettings(s: Partial<GhConfig>): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    /* storage full or unavailable */
  }
}

const API = 'https://api.github.com'

function ghHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function utf8ToBase64(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64.replace(/\s+/g, ''))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

async function getFile(
  cfg: GhConfig,
): Promise<{ sha: string; entries: Link[] }> {
  const url = `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(cfg.path)}?ref=${encodeURIComponent(cfg.branch)}`
  const res = await fetch(url, { headers: ghHeaders(cfg.token) })

  if (res.status === 401) throw new Error('Token ungültig oder abgelaufen.')
  if (res.status === 403)
    throw new Error('Token hat keine Lese-Berechtigung für dieses Repo.')
  if (res.status === 404)
    throw new Error(
      `Datei ${cfg.path} nicht in ${cfg.owner}/${cfg.repo}@${cfg.branch} gefunden.`,
    )
  if (!res.ok) throw new Error(`GitHub-API ${res.status}: ${await res.text()}`)

  const data = (await res.json()) as { sha?: string; content?: string; encoding?: string }
  if (!data.sha || !data.content || data.encoding !== 'base64') {
    throw new Error('Unerwartete Antwort vom GitHub Contents-Endpoint.')
  }
  const text = base64ToUtf8(data.content)
  let entries: unknown
  try {
    entries = JSON.parse(text)
  } catch {
    throw new Error('Bestehende links.json konnte nicht geparst werden.')
  }
  if (!Array.isArray(entries)) throw new Error('links.json ist kein JSON-Array.')
  return { sha: data.sha, entries: entries as Link[] }
}

async function putFile(
  cfg: GhConfig,
  body: { content: string; sha: string; message: string },
): Promise<CommitResult> {
  const url = `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(cfg.path)}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...ghHeaders(cfg.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: body.message,
      content: utf8ToBase64(body.content),
      sha: body.sha,
      branch: cfg.branch,
    }),
  })

  if (res.status === 401) throw new Error('Token ungültig oder abgelaufen.')
  if (res.status === 403)
    throw new Error('Token hat keine Schreib-Berechtigung (Contents: write fehlt).')
  if (res.status === 409 || res.status === 422)
    throw new Error('Datei wurde zwischenzeitlich geändert. Bitte erneut versuchen.')
  if (!res.ok) throw new Error(`GitHub-API ${res.status}: ${await res.text()}`)

  const data = (await res.json()) as {
    commit?: { sha?: string; html_url?: string }
  }
  return {
    sha: data.commit?.sha ?? '',
    htmlUrl: data.commit?.html_url ?? `https://github.com/${cfg.owner}/${cfg.repo}`,
  }
}

export interface CommitOptions {
  /** Maximum number of retries on sha-conflicts (default 1). */
  maxRetries?: number
}

export async function commitLink(
  cfg: GhConfig,
  link: Link,
  opts: CommitOptions = {},
): Promise<CommitResult> {
  const maxRetries = opts.maxRetries ?? 1

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { sha, entries } = await getFile(cfg)

    if (entries.some((e) => e.id === link.id)) {
      throw new Error(
        `Eintrag mit ID "${link.id}" existiert bereits. Bitte Titel anpassen.`,
      )
    }

    const next: Link[] = [link, ...entries]
    const text = JSON.stringify(next, null, 2) + '\n'
    const message = `feat(links): add "${link.title}"`

    try {
      return await putFile(cfg, { content: text, sha, message })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Retry on sha conflict only
      if (
        attempt < maxRetries &&
        msg.includes('zwischenzeitlich geändert')
      ) {
        continue
      }
      throw err
    }
  }
  // Unreachable
  throw new Error('Commit fehlgeschlagen.')
}
