interface HomeNavProps {
  linkCount: number
  workflowCount: number
  promptCount: number
  onGoLinks: () => void
  onGoWorkflows: () => void
  onGoPrompts: () => void
}

const ICON = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
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
          <svg {...ICON}>
            <path d="M9.5 14.5a3.5 3.5 0 0 0 4.95 0l3.18-3.18a3.5 3.5 0 0 0-4.95-4.95l-1.06 1.06" />
            <path d="M14.5 9.5a3.5 3.5 0 0 0-4.95 0L6.37 12.68a3.5 3.5 0 0 0 4.95 4.95l1.06-1.06" />
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
          <svg {...ICON}>
            <path d="M5 5h7M5 12h5M5 19h9" />
            <circle cx="17" cy="5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="14" cy="12" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="19" cy="19" r="1.6" fill="currentColor" stroke="none" />
            <path d="M17 6.5v3.9M14 13.5v3.9" opacity="0.55" />
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
          <svg {...ICON}>
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" />
            <path d="M8.5 8.5h7M8.5 11.5h4.5" />
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
