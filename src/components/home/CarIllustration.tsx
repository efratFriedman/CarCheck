// Decorative side view of a sedan, drawn with token colors.
export function CarIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 460 215" aria-hidden="true" focusable="false" className={className}>
      <ellipse cx="230" cy="198" rx="220" ry="12" className="fill-navy opacity-70" />
      <path
        d="M112 90 L160 36 Q168 28 182 28 L288 28 Q302 28 310 36 L362 90 Z"
        className="fill-surface"
      />
      <path d="M134 88 L174 44 L222 44 L222 88 Z" className="fill-navy-soft" />
      <path d="M238 44 L290 44 L334 88 L238 88 Z" className="fill-navy-soft" />
      <path
        d="M40 104 Q40 92 54 90 L112 84 L362 84 L404 92 Q420 96 420 110 L420 152 Q420 160 412 160 L48 160 Q40 160 40 152 Z"
        className="fill-surface"
      />
      <rect x="40" y="126" width="380" height="34" rx="8" className="fill-border" />
      <rect x="222" y="100" width="24" height="5" rx="2.5" className="fill-muted opacity-60" />
      <rect x="44" y="104" width="18" height="14" rx="3" className="fill-danger opacity-80" />
      <rect x="396" y="104" width="22" height="14" rx="4" className="fill-amber opacity-80" />
      {[120, 340].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="160" r="40" className="fill-navy" />
          <circle cx={cx} cy="160" r="19" className="fill-muted" />
          <circle cx={cx} cy="160" r="8" className="fill-navy" />
        </g>
      ))}
    </svg>
  )
}
