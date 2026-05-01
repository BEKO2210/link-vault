interface HomeNavProps {
  linkCount: number
  workflowCount: number
  promptCount: number
  onGoLinks: () => void
  onGoWorkflows: () => void
  onGoPrompts: () => void
}

export function HomeNav({
  linkCount,
  workflowCount,
  promptCount,
  onGoLinks,
  onGoWorkflows,
  onGoPrompts,
}: HomeNavProps) {
  return (
    <nav className="home-nav" aria-label="Hauptbereiche">
      <button type="button" className="home-card home-card--links" onClick={onGoLinks}>
        <span className="home-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.07 0l3.18-3.18a5 5 0 0 0-7.07-7.07L11.5 4.5" />
            <path d="M14 11a5 5 0 0 0-7.07 0L3.75 14.18a5 5 0 0 0 7.07 7.07L12.5 19.5" />
          </svg>
        </span>
        <span className="home-card__kicker">Sammlung</span>
        <span className="home-card__title">Links</span>
        <span className="home-card__desc">Kuratierte Tools, Modelle und Resourcen — durchsuchen, filtern, öffnen.</span>
        <span className="home-card__count">
          <strong>{linkCount}</strong> Einträge
        </span>
        <span className="home-card__cta" aria-hidden="true">→</span>
      </button>

      <button type="button" className="home-card home-card--workflows" onClick={onGoWorkflows}>
        <span className="home-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h10M4 18h16" />
            <circle cx="18" cy="12" r="2.2" fill="currentColor" />
          </svg>
        </span>
        <span className="home-card__kicker">How-Tos</span>
        <span className="home-card__title">Workflows</span>
        <span className="home-card__desc">Schritt-für-Schritt-Anleitungen zu Setup, APIs und Tricks.</span>
        <span className="home-card__count">
          <strong>{workflowCount}</strong> {workflowCount === 1 ? 'Workflow' : 'Workflows'}
        </span>
        <span className="home-card__cta" aria-hidden="true">→</span>
      </button>

      <button type="button" className="home-card home-card--prompts" onClick={onGoPrompts}>
        <span className="home-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 9h8M8 13h6" />
          </svg>
        </span>
        <span className="home-card__kicker">Library</span>
        <span className="home-card__title">Prompts</span>
        <span className="home-card__desc">Geprüfte Prompt-Vorlagen — kopieren, anpassen, anwenden.</span>
        <span className="home-card__count">
          <strong>{promptCount}</strong> {promptCount === 1 ? 'Prompt' : 'Prompts'}
        </span>
        <span className="home-card__cta" aria-hidden="true">→</span>
      </button>
    </nav>
  )
}
