import React, { useMemo } from 'react'

const COLORS = ['#1f8fff', '#ff4ea1', '#ffd400', '#8b5a2b', '#1faa4a', '#ff8a1f']

export default function Confetti({ count = 80 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.6,
        duration: 2.4 + Math.random() * 2.5,
        color: COLORS[i % COLORS.length],
        rot: Math.random() * 360,
      })),
    [count]
  )
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
