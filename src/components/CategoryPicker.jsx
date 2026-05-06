import React from 'react'
import { CATEGORIES, CATEGORY_ORDER } from '../data/questions.js'

// Selector de categoría usado cuando un jugador con los 6 quesitos llega al
// centro: los demás eligen la categoría de la pregunta final.
export default function CategoryPicker({ onPick, title = 'Elegid la categoría final' }) {
  return (
    <div className="modal-backdrop">
      <div className="q-card">
        <div className="q-band" style={{ background: '#1f1b16', color: '#f5e9c8', borderBottomColor: '#1f1b16' }}>
          <span>★ CASILLA CENTRAL ★</span>
        </div>
        <div className="q-body" style={{ paddingBottom: 8 }}>{title}</div>
        <div className="cat-picker">
          {CATEGORY_ORDER.map((cat) => {
            const c = CATEGORIES[cat]
            return (
              <button
                key={cat}
                className="cat-pick-btn"
                style={{ background: c.color }}
                onClick={() => onPick(cat)}
              >
                <span className="emoji" aria-hidden>{c.emoji}</span>
                <span>{c.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
