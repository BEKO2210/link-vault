interface HeroProps {
  onExport: () => void
}

export function Hero({ onExport }: HeroProps) {
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
        <div className="hero__cta">
          <a className="btn btn--primary" href="#form">
            Neuen Link vorbereiten
          </a>
          <button className="btn btn--ghost" onClick={onExport} type="button">
            Alle Links als JSON
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>
    </header>
  )
}
