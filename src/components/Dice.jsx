import React, { useState } from 'react'

// Patrones de puntos para el dado (1-6)
const DOT_POSITIONS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function DiceFace({ value }) {
  const dots = DOT_POSITIONS[value] || [4]
  return (
    <div className="dice-face" aria-label={`Dado ${value}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} style={{ visibility: dots.includes(i) ? 'visible' : 'hidden' }} />
      ))}
    </div>
  )
}

export default function Dice({ value, rolling, onRoll, disabled, label = 'Tirar dado' }) {
  return (
    <button
      className={`dice-button ${rolling ? 'rolling' : ''}`}
      onClick={onRoll}
      disabled={disabled || rolling}
      aria-label={label}
    >
      <DiceFace value={value} />
    </button>
  )
}
