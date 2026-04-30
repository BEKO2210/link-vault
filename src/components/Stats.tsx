interface StatsProps {
  total: number
  categories: number
  favorites: number
  tags: number
}

export function Stats({ total, categories, favorites, tags }: StatsProps) {
  const items: Array<{ label: string; value: number }> = [
    { label: 'Links', value: total },
    { label: 'Kategorien', value: categories },
    { label: 'Favoriten', value: favorites },
    { label: 'Tags', value: tags },
  ]
  return (
    <section className="stats" aria-label="Statistiken">
      {items.map((it) => (
        <div className="stat" key={it.label}>
          <span className="stat__value">{it.value}</span>
          <span className="stat__label">{it.label}</span>
        </div>
      ))}
    </section>
  )
}
