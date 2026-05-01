import { BrandMark } from './BrandMark'

interface HeroProps {
  onExport: () => void
  exportLabel?: string
  compact?: boolean
}

export function Hero({ onExport, exportLabel = 'JSON', compact = false }: HeroProps) {
  if (compact) {
    return (
      <header className="hero hero--compact">
        <a className="hero__brand" href="#/" aria-label="Zur Startseite">
          <BrandMark size={28} animated />
          <span>
            Belkis <span className="hero__title-grad">Link Vault</span>
          </span>
        </a>
        <button
          className="btn btn--ghost btn--sm"
          onClick={onExport}
          type="button"
          title={`${exportLabel} herunterladen`}
        >
          {exportLabel} ↓
        </button>
      </header>
    )
  }
  return (
    <header className="hero">
      <div className="hero__halo" aria-hidden="true" />
      <div className="hero__content">
        <BrandMark size={108} animated className="hero__logo" />
        <span className="eyebrow">Personal Vault</span>
        <h1 className="hero__title">
          Belkis <span className="hero__title-grad">Link Vault</span>
        </h1>
        <p className="hero__subtitle">
          Meine persönliche Edge-of-Tech-Sammlung für KI, Coding, Tools, Projekte und Inspiration.
        </p>
        <p className="hero__claim">Sammeln · Filtern · Wiederfinden · Weiterbauen</p>
      </div>
    </header>
  )
}
