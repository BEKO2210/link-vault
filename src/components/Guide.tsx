const STEPS: string[] = [
  'Link im Formular eintragen',
  'JSON kopieren',
  'Datei src/data/links.json öffnen',
  'Eintrag hinzufügen',
  'Commit pushen',
  'GitHub Pages aktualisiert die Webseite automatisch',
]

export function Guide() {
  return (
    <section className="guide" aria-labelledby="guide-title">
      <header className="section-head">
        <h2 id="guide-title">So erweiterst du deine Sammlung</h2>
        <p>Sechs Schritte vom neuen Link bis zur veröffentlichten Sammlung.</p>
      </header>
      <ol className="guide__list">
        {STEPS.map((step, i) => (
          <li className="guide__item" key={step}>
            <span className="guide__num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
