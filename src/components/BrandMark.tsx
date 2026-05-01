interface BrandMarkProps {
  size?: number
  animated?: boolean
  className?: string
  ariaHidden?: boolean
}

let __idSeed = 0

export function BrandMark({
  size = 64,
  animated = false,
  className,
  ariaHidden = true,
}: BrandMarkProps) {
  const id = `bm-${++__idSeed}`
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={ariaHidden ? undefined : 'img'}
      aria-hidden={ariaHidden ? true : undefined}
      aria-label={ariaHidden ? undefined : 'Belkis Link Vault'}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="55%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#f0abfc" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>

      {animated && (
        <circle
          className="bm__halo"
          cx="50"
          cy="50"
          r="44"
          fill={`url(#${id}-glow)`}
        />
      )}

      <g className={animated ? 'bm__spin' : undefined}>
        <polygon
          points="50,9 85,29 85,71 50,91 15,71 15,29"
          fill="none"
          stroke={`url(#${id}-grad)`}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </g>

      <g className={animated ? 'bm__counter' : undefined}>
        <polygon
          points="50,22 75,36 75,64 50,78 25,64 25,36"
          fill={`url(#${id}-grad)`}
          opacity="0.10"
        />
        <polygon
          points="50,22 75,36 75,64 50,78 25,64 25,36"
          fill="none"
          stroke={`url(#${id}-grad)`}
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeOpacity="0.55"
        />
      </g>

      <path
        d="M37 40 L50 64 L63 40"
        fill="none"
        stroke={`url(#${id}-grad)`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="36" r="2.4" fill={`url(#${id}-grad)`} />
    </svg>
  )
}
