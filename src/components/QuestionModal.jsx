import React, { useState, useEffect } from 'react'
import { CATEGORIES } from '../data/questions.js'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuestionModal({
  question,
  category,
  isWedgeAttempt,
  isFinal,
  onResolve, // (correct: boolean) => void
}) {
  const [picked, setPicked] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const cat = CATEGORIES[category]

  // Reset al cambiar de pregunta
  useEffect(() => {
    setPicked(null)
    setRevealed(false)
  }, [question])

  function handlePick(idx) {
    if (revealed) return
    setPicked(idx)
    setRevealed(true)
  }

  function handleNext() {
    if (picked == null) return
    onResolve(picked === question.correct)
  }

  const correctIdx = question.correct

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="qcat">
      <div className="q-card" style={{ borderColor: cat.dark }}>
        <div className="q-band" id="qcat" style={{ background: cat.color, color: cat.dark }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="cat-emoji" aria-hidden>{cat.emoji}</span>
            <span style={{ color: cat.dark }}>{cat.name}</span>
          </span>
          {isFinal ? (
            <span style={{ fontSize: 11, color: cat.dark }}>★ FINAL ★</span>
          ) : isWedgeAttempt ? (
            <span style={{ fontSize: 11, color: cat.dark }}>QUESITO</span>
          ) : null}
        </div>

        <div className="q-body">{question.question}</div>

        <div className="q-options">
          {question.options.map((opt, idx) => {
            const isCorrect = idx === correctIdx
            const isPicked = idx === picked
            let cls = 'q-option'
            if (revealed) {
              if (isCorrect) cls += ' correct'
              else if (isPicked) cls += ' wrong'
            }
            return (
              <button
                key={idx}
                className={cls}
                onClick={() => handlePick(idx)}
                disabled={revealed}
              >
                <span className="letter">{LETTERS[idx]}</span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>

        {revealed && (
          <div className="q-footer">
            <button className="btn-primary" onClick={handleNext}>
              {picked === correctIdx ? 'CONTINUAR ✓' : 'SIGUIENTE TURNO →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
