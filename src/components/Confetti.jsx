import React, { useMemo } from 'react'

const COLORS = ['#1f8fff', '#ff4ea1', '#ffd400', '#8b5a2b', '#1faa4a', '#ff8a1f']
const SHAPES = ['star', 'diamond', 'zigzag', 'circle', 'sparkle', 'tri']

function Shape({ type, color }) {
  switch (type) {
    case 'star':
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
          <path
            d="M12 2 L14.6 9.2 L22 9.6 L16.2 14 L18.4 21 L12 17 L5.6 21 L7.8 14 L2 9.6 L9.4 9.2 Z"
            fill={color}
            stroke="#1f1b16"
            strokeWidth="1"
          />
        </svg>
      )
    case 'diamond':
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
          <path d="M12 1 L23 12 L12 23 L1 12 Z" fill={color} stroke="#1f1b16" strokeWidth="1.5" />
        </svg>
      )
    case 'zigzag':
      return (
        <svg viewBox="0 0 30 12" width="100%" height="100%" aria-hidden>
          <path
            d="M1 6 L5 1 L9 6 L13 1 L17 6 L21 1 L25 6 L29 1"
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'circle':
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
          <circle cx="12" cy="12" r="10" fill={color} stroke="#1f1b16" strokeWidth="1.5" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
          <path
            d="M12 1 L13 11 L23 12 L13 13 L12 23 L11 13 L1 12 L11 11 Z"
            fill={color}
            stroke="#1f1b16"
            strokeWidth="0.8"
          />
        </svg>
      )
    case 'tri':
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
          <path d="M12 2 L22 21 L2 21 Z" fill={color} stroke="#1f1b16" strokeWidth="1.5" />
        </svg>
      )
    default:
      return null
  }
}

export default function Confetti({ count = 90 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const size = 14 + Math.random() * 22 // 14..36 px
        return {
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 1.6,
          duration: 2.6 + Math.random() * 3,
          color: COLORS[i % COLORS.length],
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          rot: Math.random() * 360,
          size,
          drift: (Math.random() - 0.5) * 200, // px de deriva horizontal
        }
      }),
    [count]
  )
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            transform: `rotate(${p.rot}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
          }}
        >
          <Shape type={p.shape} color={p.color} />
        </span>
      ))}
    </div>
  )
}
