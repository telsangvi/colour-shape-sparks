interface Props { id: string; color: string; size?: number; dashed?: boolean }

export default function ShapeDisplay({ id, color, size = 100, dashed = false }: Props) {
  const stroke     = dashed ? color : 'none'
  const fill       = dashed ? 'none' : color
  const strokeDash = dashed ? '8 5' : undefined
  const sw         = dashed ? 3 : 0

  const common = { fill, stroke, strokeWidth: sw, strokeDasharray: strokeDash }

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible' }}>
      {id === 'circle'    && <circle cx="50" cy="50" r="42" {...common} />}
      {id === 'square'    && <rect x="9" y="9" width="82" height="82" rx="5" {...common} />}
      {id === 'triangle'  && <polygon points="50,7 93,88 7,88" {...common} />}
      {id === 'rectangle' && <rect x="5" y="22" width="90" height="56" rx="5" {...common} />}
      {id === 'star'      && <polygon points="50,6 61,35 93,35 68,57 79,91 50,70 21,91 32,57 7,35 39,35" {...common} />}
      {id === 'heart'     && <path d="M50,80 C20,60 8,38 8,28 C8,15 18,6 30,6 C38,6 46,11 50,17 C54,11 62,6 70,6 C82,6 92,15 92,28 C92,38 80,60 50,80Z" {...common} />}
      {id === 'oval'      && <ellipse cx="50" cy="50" rx="44" ry="28" {...common} />}
      {id === 'hexagon'   && <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" {...common} />}
    </svg>
  )
}
