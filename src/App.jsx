import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Board, {
  TOTAL_TILES,
  HQ_INDICES,
  isHQ,
  categoryAtIndex,
  DEFAULT_PLAYER_COLORS,
} from './components/Board.jsx'
import PlayerHUD from './components/PlayerHUD.jsx'
import Dice from './components/Dice.jsx'
import QuestionModal from './components/QuestionModal.jsx'
import CategoryPicker from './components/CategoryPicker.jsx'
import Confetti from './components/Confetti.jsx'
import { CATEGORIES, CATEGORY_ORDER, questions } from './data/questions.js'

const PLAYER_NAMES = ['Guille', 'Ana', 'Edu']
const PLAYER_COLORS = ['#ff3b30', '#ff4ea1', '#0a84ff']
const PLAYER_AVATARS = [
  './players/guille.jpeg',
  './players/ana.jpeg',
  './players/edu.jpeg',
]

function makePlayers() {
  return PLAYER_NAMES.map((name, i) => ({
    id: i,
    name,
    avatar: PLAYER_AVATARS[i],
    position: 0,        // todos arrancan en la misma casilla (HQ Geografía)
    wedges: [],         // categorías ya conseguidas
  }))
}

// Selecciona una pregunta aleatoria de una categoría que el grupo aún no haya visto
// recientemente (anti-repetición simple por sesión).
function pickQuestion(category, askedIds, allQuestions) {
  const pool = allQuestions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q, idx }) => q.category === category && !askedIds.has(idx))
  if (pool.length === 0) {
    // Si ya las hicimos todas, reseteamos
    return null
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function App() {
  const [phase, setPhase] = useState('intro') // 'intro' | 'playing' | 'won'
  const [players, setPlayers] = useState(makePlayers)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [diceValue, setDiceValue] = useState(1)
  const [diceRolling, setDiceRolling] = useState(false)
  const [awaitingDice, setAwaitingDice] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(null) // { q, idx, category, isWedge, isFinal }
  const [askedIds, setAskedIds] = useState(() => new Set())
  const [pickingFinalCategory, setPickingFinalCategory] = useState(false)
  const [result, setResult] = useState(null) // {kind: 'ok'|'bad'|'wedge', text}
  const [winner, setWinner] = useState(null)

  const player = players[currentPlayer]

  function startGame() {
    setPhase('playing')
    setPlayers(makePlayers())
    setCurrentPlayer(0)
    setDiceValue(1)
    setAskedIds(new Set())
    setAwaitingDice(true)
    setResult(null)
    setWinner(null)
  }

  // Termina el turno y pasa al siguiente jugador
  const nextTurn = useCallback(() => {
    setCurrentPlayer((c) => (c + 1) % players.length)
    setAwaitingDice(true)
    setCurrentQuestion(null)
    setPickingFinalCategory(false)
  }, [players.length])

  // Permite repetir turno al jugador actual
  const repeatTurn = useCallback(() => {
    setAwaitingDice(true)
    setCurrentQuestion(null)
    setPickingFinalCategory(false)
  }, [])

  // Lanza una pregunta dada una categoría y si es intento de quesito o final
  const launchQuestion = useCallback(
    (category, { isWedge = false, isFinal = false } = {}) => {
      let pool = askedIds
      let chosen = pickQuestion(category, pool, questions)
      if (!chosen) {
        // Reset si nos quedamos sin preguntas
        pool = new Set()
        chosen = pickQuestion(category, pool, questions)
      }
      const newAsked = new Set(pool)
      newAsked.add(chosen.idx)
      setAskedIds(newAsked)
      setCurrentQuestion({
        q: chosen.q,
        idx: chosen.idx,
        category,
        isWedge,
        isFinal,
      })
    },
    [askedIds]
  )

  // Maneja la tirada del dado
  const rollDice = useCallback(() => {
    if (!awaitingDice || diceRolling) return
    setDiceRolling(true)
    setResult(null)
    // Visual: durante 600ms cambia rapido el numero
    const flicker = setInterval(() => {
      setDiceValue(1 + Math.floor(Math.random() * 6))
    }, 80)
    setTimeout(() => {
      clearInterval(flicker)
      const final = 1 + Math.floor(Math.random() * 6)
      setDiceValue(final)
      setDiceRolling(false)
      setAwaitingDice(false)

      // Mover al jugador
      const me = players[currentPlayer]
      const newPos = (me.position + final) % TOTAL_TILES
      setPlayers((prev) =>
        prev.map((p, i) => (i === currentPlayer ? { ...p, position: newPos } : p))
      )

      // Resolver casilla
      setTimeout(() => {
        if (isHQ(newPos)) {
          const cat = CATEGORY_ORDER[HQ_INDICES.indexOf(newPos)]
          const hasAllWedges = me.wedges.length === 6
          if (hasAllWedges) {
            // Pregunta final: los demás eligen categoría
            setPickingFinalCategory(true)
          } else {
            // Intento de quesito (si aún no lo tiene), si no, pregunta normal
            const isWedge = !me.wedges.includes(cat)
            launchQuestion(cat, { isWedge })
          }
        } else {
          const cat = categoryAtIndex(newPos)
          launchQuestion(cat)
        }
      }, 350)
    }, 600)
  }, [awaitingDice, diceRolling, players, currentPlayer, launchQuestion])

  // Resolver respuesta a la pregunta
  const handleAnswer = useCallback(
    (correct) => {
      const q = currentQuestion
      if (!q) return
      const me = players[currentPlayer]

      if (q.isFinal) {
        if (correct) {
          setWinner(me)
          setPhase('won')
          return
        }
        // Falla: siguiente turno
        setResult({ kind: 'bad', text: 'CASI… vuelve a intentarlo en tu próximo turno' })
        setTimeout(() => {
          setResult(null)
          nextTurn()
        }, 1700)
        return
      }

      if (correct) {
        if (q.isWedge && !me.wedges.includes(q.category)) {
          const newWedges = [...me.wedges, q.category]
          setPlayers((prev) =>
            prev.map((p, i) => (i === currentPlayer ? { ...p, wedges: newWedges } : p))
          )
          setResult({ kind: 'wedge', text: `¡Quesito de ${CATEGORIES[q.category].name}! 🧀` })
        } else {
          setResult({ kind: 'ok', text: '¡Correcto! Repites turno' })
        }
        setTimeout(() => {
          setResult(null)
          repeatTurn()
        }, 1500)
      } else {
        setResult({ kind: 'bad', text: 'Fallaste — pasa el turno' })
        setTimeout(() => {
          setResult(null)
          nextTurn()
        }, 1500)
      }
    },
    [currentQuestion, players, currentPlayer, nextTurn, repeatTurn]
  )

  function handlePickFinalCategory(cat) {
    setPickingFinalCategory(false)
    launchQuestion(cat, { isFinal: true })
  }

  // ─── INTRO ─────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="fullscreen">
        <div className="intro-card">
          <h1>TRIVIAL<br />90s · 2000s</h1>
          <div className="stamp">★ EDICIÓN VINTAGE ★</div>
          <div className="intro-players">
            {PLAYER_NAMES.map((n, i) => (
              <div key={n} className="intro-player">
                <img
                  src={PLAYER_AVATARS[i]}
                  alt={n}
                  className="intro-avatar"
                  style={{ borderColor: PLAYER_COLORS[i] }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <div className="chip" style={{ background: PLAYER_COLORS[i], color: '#fff' }}>
                  {n}
                </div>
              </div>
            ))}
          </div>
          <p>
            102 preguntas de cultura pop, política, ciencia y deportes de los años{' '}
            <strong>1990 a 2009</strong>. Tira el dado, contesta bien, gana quesitos.<br />
            Quien junte los <strong>6 colores</strong> y acierte la final, gana.
          </p>
          <button className="btn-primary" onClick={startGame} style={{ marginTop: 8 }}>
            EMPEZAR PARTIDA →
          </button>
        </div>
      </div>
    )
  }

  // ─── VICTORIA ──────────────────────────────────────────────
  if (phase === 'won' && winner) {
    return (
      <>
        <Confetti count={100} />
        <div className="fullscreen">
          <div className="win-card">
            <h1>¡GANADOR!</h1>
            <div className="winner">{winner.name}</div>
            <div className="small">los 6 quesitos + final acertada</div>
            <button className="btn-primary" onClick={startGame}>
              JUGAR DE NUEVO ↻
            </button>
          </div>
        </div>
      </>
    )
  }

  // ─── JUEGO ─────────────────────────────────────────────────
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          TRIVIAL
          <span className="subtitle">90s · 2000s</span>
        </h1>
        <button className="btn-reset" onClick={() => { if (confirm('¿Reiniciar partida?')) startGame() }}>
          ↻ RESET
        </button>
      </header>

      <PlayerHUD
        players={players}
        currentPlayer={currentPlayer}
        playerColors={PLAYER_COLORS}
      />

      <div className="board-wrap">
        <Board players={players} currentPlayer={currentPlayer} playerColors={PLAYER_COLORS} />
      </div>

      <div className="action-bar">
        <div className="turn-indicator">
          TURNO DE <span className="turn-name">{player.name.toUpperCase()}</span>
        </div>
        <Dice
          value={diceValue}
          rolling={diceRolling}
          disabled={!awaitingDice || !!currentQuestion || pickingFinalCategory}
          onRoll={rollDice}
        />
        <div className="dice-label">
          {awaitingDice ? 'Pulsa para tirar el dado' : `Sacaste un ${diceValue}`}
        </div>
      </div>

      {result && (
        <div className={`result-banner ${result.kind}`}>{result.text}</div>
      )}

      {pickingFinalCategory && (
        <CategoryPicker
          onPick={handlePickFinalCategory}
          title={`${player.name}, los demás eligen la categoría final`}
        />
      )}

      {currentQuestion && (
        <QuestionModal
          question={currentQuestion.q}
          category={currentQuestion.category}
          isWedgeAttempt={currentQuestion.isWedge}
          isFinal={currentQuestion.isFinal}
          onResolve={handleAnswer}
        />
      )}

      <footer className="app-footer">© trivial vintage · made with ♥ in 2026</footer>
    </div>
  )
}
