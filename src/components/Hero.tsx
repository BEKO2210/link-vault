interface HeroProps {
  onExport: () => void
  compact?: boolean
}

export function Hero({ onExport, compact = false }: HeroProps) {
  if (compact) {
    return (
      <header className="hero hero--compact">
        <a className="hero__brand" href="#/">
          <span className="hero__brand-mark" aria-hidden="true">▲</span>
          <span>
            Belkis <span className="hero__title-grad">Link Vault</span>
          </span>
        </a>
        <button className="btn btn--ghost btn--sm" onClick={onExport} type="button">
          JSON ↓
        </button>
      </header>
    )
  }
  return (
    <header className="hero">
      <div className="hero__halo" aria-hidden="true" />
      <div className="hero__content">
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
