import React, { useState } from 'react'
import { CATEGORIES, CATEGORY_ORDER } from '../data/questions.js'

function Avatar({ src, color, size = 28 }) {
  const [errored, setErrored] = useState(false)
  if (!src || errored) {
    return (
      <span
        className="pdot"
        style={{ background: color, width: size, height: size, borderRadius: '50%', display: 'inline-block' }}
      />
    )
  }
  return (
    <img
      src={src}
      alt=""
      className="pavatar"
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid currentColor', flexShrink: 0 }}
      onError={() => setErrored(true)}
    />
  )
}

export default function PlayerHUD({ players, currentPlayer, playerColors }) {
  return (
    <div className="players">
      {players.map((p, idx) => (
        <div key={p.id} className={`player-card ${idx === currentPlayer ? 'active' : ''}`}>
          <div className="pname">
            <Avatar src={p.avatar} color={playerColors[idx]} size={28} />
            <span>{p.name}</span>
          </div>
          <div className="wedges">
            {CATEGORY_ORDER.map((cat) => {
              const has = p.wedges.includes(cat)
              return (
                <div
                  key={cat}
                  className={`wedge ${has ? 'filled' : ''}`}
                  style={has ? { background: CATEGORIES[cat].color } : undefined}
                  title={CATEGORIES[cat].name}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
