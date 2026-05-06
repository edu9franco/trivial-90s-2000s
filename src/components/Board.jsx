import React from 'react'
import { CATEGORIES, CATEGORY_ORDER } from '../data/questions.js'

// 42 casillas en el anillo exterior. 6 de ellas son HQ (quesito) en posiciones
// equiespaciadas cada 7 casillas. Las casillas normales ciclan los 6 colores.
export const TOTAL_TILES = 42
export const HQ_INDICES = [0, 7, 14, 21, 28, 35]

// Devuelve la categoría correspondiente a cada índice de casilla
export function categoryAtIndex(i) {
  if (HQ_INDICES.includes(i)) {
    return CATEGORY_ORDER[HQ_INDICES.indexOf(i)]
  }
  // Casillas no-HQ: ciclan los 6 colores empezando por la siguiente del HQ
  // Esto da exactamente 6 colores entre cada pareja de HQs.
  const segment = Math.floor(i / 7)
  const within = (i % 7) - 1 // 0..5 dentro del segmento
  return CATEGORY_ORDER[(HQ_INDICES.indexOf(segment * 7) + 1 + within) % 6]
}

export function isHQ(i) {
  return HQ_INDICES.includes(i)
}

// --- Geometría del tablero -------------------------------------------------
const CX = 500
const CY = 500
const RING_OUTER = 470
const RING_INNER = 330
const HQ_OUTER = 490
const HQ_INNER = 310
const HUB_RADIUS = 130

const TAU = Math.PI * 2

// Cada casilla ocupa este arco
const ANGLE_PER_TILE = TAU / TOTAL_TILES
// Empezamos arriba (-π/2) para que la posición 0 esté arriba
const ANGLE_OFFSET = -TAU / 4 - ANGLE_PER_TILE / 2

function polarToXY(r, angle) {
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)]
}

// Construye un sector anular (annular sector) entre dos ángulos y dos radios
function annularSector(rIn, rOut, a0, a1) {
  const [x1, y1] = polarToXY(rOut, a0)
  const [x2, y2] = polarToXY(rOut, a1)
  const [x3, y3] = polarToXY(rIn, a1)
  const [x4, y4] = polarToXY(rIn, a0)
  const largeArc = a1 - a0 > Math.PI ? 1 : 0
  return [
    `M ${x1} ${y1}`,
    `A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ')
}

// Centro de cada casilla (para colocar fichas y emojis)
export function tileCenter(i) {
  const a = ANGLE_OFFSET + (i + 0.5) * ANGLE_PER_TILE
  const r = isHQ(i) ? (HQ_INNER + HQ_OUTER) / 2 : (RING_INNER + RING_OUTER) / 2
  return polarToXY(r, a)
}

// Posición de la ficha de un jugador en una casilla, separadas en pequeño
// triángulo para que no se solapen.
export function tokenPosition(tileIdx, playerIdx, totalPlayers) {
  const [tx, ty] = tileCenter(tileIdx)
  if (totalPlayers <= 1) return [tx, ty]
  const spread = 22
  const angle = (playerIdx / totalPlayers) * TAU - Math.PI / 2
  return [tx + spread * Math.cos(angle), ty + spread * Math.sin(angle)]
}

export const DEFAULT_PLAYER_COLORS = ['#ff3b30', '#ff4ea1', '#0a84ff', '#34c759', '#af52de', '#ff9500']

export default function Board({ players, currentPlayer, playerColors = DEFAULT_PLAYER_COLORS }) {
  const tiles = []
  for (let i = 0; i < TOTAL_TILES; i++) {
    const a0 = ANGLE_OFFSET + i * ANGLE_PER_TILE
    const a1 = a0 + ANGLE_PER_TILE
    const cat = categoryAtIndex(i)
    const color = CATEGORIES[cat].color
    const dark = CATEGORIES[cat].dark
    const hq = isHQ(i)
    const path = hq
      ? annularSector(HQ_INNER, HQ_OUTER, a0 + 0.005, a1 - 0.005)
      : annularSector(RING_INNER, RING_OUTER, a0 + 0.01, a1 - 0.01)
    tiles.push(
      <g key={i}>
        <path d={path} fill={color} stroke={dark} strokeWidth={hq ? 3 : 1.5} />
        {hq && (() => {
          const [ex, ey] = tileCenter(i)
          return (
            <text
              x={ex}
              y={ey + 12}
              textAnchor="middle"
              fontSize="42"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {CATEGORIES[cat].emoji}
            </text>
          )
        })()}
      </g>
    )
  }

  // HUB central: 6 cuñas de colores
  const hubWedges = CATEGORY_ORDER.map((cat, i) => {
    const a0 = ANGLE_OFFSET + i * (TAU / 6)
    const a1 = a0 + TAU / 6
    const [x1, y1] = polarToXY(HUB_RADIUS, a0)
    const [x2, y2] = polarToXY(HUB_RADIUS, a1)
    const path = [
      `M ${CX} ${CY}`,
      `L ${x1} ${y1}`,
      `A ${HUB_RADIUS} ${HUB_RADIUS} 0 0 1 ${x2} ${y2}`,
      'Z',
    ].join(' ')
    return (
      <path
        key={cat}
        d={path}
        fill={CATEGORIES[cat].color}
        stroke={CATEGORIES[cat].dark}
        strokeWidth="2"
      />
    )
  })

  // Tokens de jugadores (con avatar si existe)
  const tokens = players.map((p, idx) => {
    const [px, py] = tokenPosition(p.position, idx, players.length)
    const isActive = idx === currentPlayer
    const tokenR = 22
    const clipId = `clip-token-${idx}`
    return (
      <g key={p.id}>
        {isActive && (
          <circle cx={px} cy={py} r={tokenR + 6} fill="none" stroke="#1f1b16" strokeWidth="3" opacity="0.9">
            <animate
              attributeName="r"
              values={`${tokenR + 4};${tokenR + 10};${tokenR + 4}`}
              dur="1.4s"
              repeatCount="indefinite"
            />
          </circle>
        )}
        <defs>
          <clipPath id={clipId}>
            <circle cx={px} cy={py} r={tokenR - 3} />
          </clipPath>
        </defs>
        {/* Aro exterior con color del jugador */}
        <circle
          cx={px}
          cy={py}
          r={tokenR}
          fill={playerColors[idx % playerColors.length]}
          stroke="#1f1b16"
          strokeWidth="3"
        />
        {p.avatar ? (
          <image
            href={p.avatar}
            x={px - (tokenR - 3)}
            y={py - (tokenR - 3)}
            width={(tokenR - 3) * 2}
            height={(tokenR - 3) * 2}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        ) : (
          <text
            x={px}
            y={py + 6}
            textAnchor="middle"
            fontSize="18"
            fontWeight="800"
            fill="#fff"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {idx + 1}
          </text>
        )}
      </g>
    )
  })

  return (
    <svg
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
      className="board"
      role="img"
      aria-label="Tablero de Trivial"
    >
      {/* Fondo cartón */}
      <defs>
        <radialGradient id="boardBg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fff7e0" />
          <stop offset="100%" stopColor="#e8d8a8" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r="495" fill="url(#boardBg)" stroke="#1f1b16" strokeWidth="6" />
      <circle cx={CX} cy={CY} r="475" fill="none" stroke="#1f1b16" strokeWidth="1" opacity="0.4" />

      {tiles}

      {/* Anillo decorativo entre ring y hub */}
      <circle
        cx={CX}
        cy={CY}
        r={RING_INNER - 8}
        fill="none"
        stroke="#1f1b16"
        strokeWidth="2"
        opacity="0.5"
      />

      <g>{hubWedges}</g>
      <circle cx={CX} cy={CY} r="36" fill="#1f1b16" stroke="#f5e9c8" strokeWidth="3" />
      <text
        x={CX}
        y={CY + 8}
        textAnchor="middle"
        fontSize="24"
        fontWeight="900"
        fill="#f5e9c8"
        style={{ userSelect: 'none' }}
      >
        ★
      </text>

      {tokens}
    </svg>
  )
}

