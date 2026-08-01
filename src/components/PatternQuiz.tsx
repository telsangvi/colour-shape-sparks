import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGameStore } from '../store/gameStore'
import { SHAPES } from '../data/shapes'
import { COLOURS } from '../data/colours'
import { speak } from '../utils/speech'
import { playTap, playCorrect, playWrong } from '../utils/sounds'
import ShapeDisplay from './ShapeDisplay'
import { TimerBar, StreakBadge, ComboFlash, getMilestone, TIMER_TOTAL } from './QuizExtras'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PatternItem { shapeId: string; colourId: string }
interface PatternQuestion {
  type: 'colorAB' | 'shapeAB' | 'colorABC'
  prompt: string
  sequence: PatternItem[]
  answer: PatternItem
  options: PatternItem[]
  answerIndex: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }
function pick<T>(arr: T[]): T      { return arr[Math.floor(Math.random() * arr.length)] }

function burst(streak: number) {
  if (streak >= 5) {
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.4 } })
    setTimeout(() => confetti({ particleCount: 60, spread: 60, angle: 60,  origin: { x: 0, y: 0.6 } }), 150)
    setTimeout(() => confetti({ particleCount: 60, spread: 60, angle: 120, origin: { x: 1, y: 0.6 } }), 150)
  } else if (streak >= 3) {
    confetti({ particleCount: 100, spread: 75, origin: { y: 0.5 } })
  } else {
    confetti({ particleCount: 70,  spread: 60, origin: { y: 0.6 } })
  }
}

// ─── Question builders ────────────────────────────────────────────────────────

function buildColorAB(): PatternQuestion {
  const shape = pick(SHAPES)
  const shuffled = shuffle(COLOURS)
  const [A, B] = shuffled.slice(0, 2)
  // sequence: A B A B → 5th is A
  const sequence: PatternItem[] = [
    { shapeId: shape.id, colourId: A.id },
    { shapeId: shape.id, colourId: B.id },
    { shapeId: shape.id, colourId: A.id },
    { shapeId: shape.id, colourId: B.id },
  ]
  const answer: PatternItem = { shapeId: shape.id, colourId: A.id }
  const distractors = shuffle(COLOURS.filter(c => c.id !== A.id && c.id !== B.id)).slice(0, 2)
  const optColours = shuffle([A, B, distractors[0], distractors[1]])
  const options = optColours.map(c => ({ shapeId: shape.id, colourId: c.id }))
  return {
    type: 'colorAB',
    prompt: 'What comes next? 🧠',
    sequence,
    answer,
    options,
    answerIndex: options.findIndex(o => o.colourId === A.id),
  }
}

function buildShapeAB(): PatternQuestion {
  const colour = pick(COLOURS)
  const shuffled = shuffle(SHAPES)
  const [A, B] = shuffled.slice(0, 2)
  // sequence: A B A B → 5th is A
  const sequence: PatternItem[] = [
    { shapeId: A.id, colourId: colour.id },
    { shapeId: B.id, colourId: colour.id },
    { shapeId: A.id, colourId: colour.id },
    { shapeId: B.id, colourId: colour.id },
  ]
  const answer: PatternItem = { shapeId: A.id, colourId: colour.id }
  const distractors = shuffle(SHAPES.filter(s => s.id !== A.id && s.id !== B.id)).slice(0, 2)
  const optShapes = shuffle([A, B, distractors[0], distractors[1]])
  const options = optShapes.map(s => ({ shapeId: s.id, colourId: colour.id }))
  return {
    type: 'shapeAB',
    prompt: 'What comes next? 🧠',
    sequence,
    answer,
    options,
    answerIndex: options.findIndex(o => o.shapeId === A.id),
  }
}

function buildColorABC(): PatternQuestion {
  const shape = pick(SHAPES)
  const shuffled = shuffle(COLOURS)
  const [A, B, C] = shuffled.slice(0, 3)
  // sequence: A B C A → 5th is B
  const sequence: PatternItem[] = [
    { shapeId: shape.id, colourId: A.id },
    { shapeId: shape.id, colourId: B.id },
    { shapeId: shape.id, colourId: C.id },
    { shapeId: shape.id, colourId: A.id },
  ]
  const answer: PatternItem = { shapeId: shape.id, colourId: B.id }
  const distractor = shuffle(COLOURS.filter(c => c.id !== A.id && c.id !== B.id && c.id !== C.id)).slice(0, 1)
  const optColours = shuffle([A, B, C, distractor[0]])
  const options = optColours.map(c => ({ shapeId: shape.id, colourId: c.id }))
  return {
    type: 'colorABC',
    prompt: 'What comes next? 🧠',
    sequence,
    answer,
    options,
    answerIndex: options.findIndex(o => o.colourId === B.id),
  }
}

const SESSION_LENGTH = 8

function buildSession(): PatternQuestion[] {
  const qs: PatternQuestion[] = [
    buildColorAB(), buildColorAB(), buildColorAB(),
    buildShapeAB(), buildShapeAB(), buildShapeAB(),
    buildColorABC(), buildColorABC(),
  ]
  return shuffle(qs)
}

// ─── Component ────────────────────────────────────────────────────────────────

const PHRASES = [
  "Yay! That's right!", 'Correct! Well done!', 'Amazing! Great job!',
  'Yes! You got it!', 'Brilliant! Keep going!',
]

function colourHex(id: string): string {
  return COLOURS.find(c => c.id === id)?.hex ?? '#9CA3AF'
}

export default function PatternQuiz() {
  const { recordCorrect, resetStreak, streak, setPhase } = useGameStore()

  const [questions]                 = useState(() => buildSession())
  const [qIndex, setQIndex]         = useState(0)
  const [selected, setSelected]     = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft]     = useState(TIMER_TOTAL)
  const [combo, setCombo]           = useState<string | null>(null)

  const q = questions[qIndex]

  useEffect(() => { speak(q.prompt) }, [qIndex])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selected !== null) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          resetStreak()
          advanceOrEnd()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [selected, qIndex])  // eslint-disable-line react-hooks/exhaustive-deps

  function advanceOrEnd() {
    if (qIndex + 1 >= SESSION_LENGTH) {
      setPhase('summary')
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setShowResult(false)
      setTimeLeft(TIMER_TOTAL)
    }
  }

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    playTap()
    const correct = idx === q.answerIndex
    setSelected(idx)
    setShowResult(true)

    if (correct) {
      playCorrect()
      const newStreak = streak + 1
      recordCorrect()
      burst(newStreak)
      const milestone = getMilestone(newStreak)
      if (milestone) { setCombo(milestone); setTimeout(() => setCombo(null), 1200) }
      const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
      speak(phrase, () => setTimeout(advanceOrEnd, 300))
    } else {
      playWrong()
      resetStreak()
      speak('Try again!')
      setTimeout(() => { setSelected(null); setShowResult(false) }, 700)
    }
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <ComboFlash text={combo} />
      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex flex-col items-center gap-3 w-full"
        >
          {/* Progress dots */}
          <div className="flex gap-1.5 w-full justify-center">
            {questions.map((_, i) => (
              <div key={i} className="h-2 rounded-full transition-all duration-300"
                style={{ width: i === qIndex ? 24 : 14,
                  background: i < qIndex ? '#8B5CF6' : i === qIndex ? '#EC4899' : '#DDD6FE' }} />
            ))}
          </div>

          <TimerBar timeLeft={timeLeft} />
          <StreakBadge streak={streak} />

          <p className="text-xl font-extrabold text-gray-700 text-center">{q.prompt}</p>

          {/* Sequence row */}
          <div className="bg-white rounded-3xl shadow-lg p-3 w-full">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {q.sequence.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-2 flex items-center justify-center">
                  <ShapeDisplay id={item.shapeId} color={colourHex(item.colourId)} size={50} />
                </div>
              ))}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-2 flex items-center justify-center"
                style={{ width: 66, height: 66 }}>
                <span className="text-2xl font-extrabold text-purple-300">?</span>
              </div>
            </div>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {q.options.map((opt, idx) => {
              const isCorrect  = idx === q.answerIndex
              const isSelected = idx === selected
              let cls = 'bg-white border-2 border-gray-100 hover:border-purple-200 hover:shadow'
              if (showResult && isSelected && isCorrect)  cls = 'bg-green-50 border-2 border-green-400 scale-105'
              if (showResult && isSelected && !isCorrect) cls = 'bg-red-50 border-2 border-red-400 animate-shake'
              if (showResult && !isSelected && isCorrect) cls = 'bg-green-50 border-2 border-green-300'
              return (
                <motion.button
                  key={idx}
                  whileTap={selected === null ? { scale: 0.94 } : {}}
                  onPointerDown={() => playTap()}
                  onClick={() => handleSelect(idx)}
                  disabled={selected !== null}
                  className={`rounded-2xl p-4 flex items-center justify-center transition-all duration-200 ${cls} disabled:cursor-default`}
                >
                  <ShapeDisplay id={opt.shapeId} color={colourHex(opt.colourId)} size={60} />
                </motion.button>
              )
            })}
          </div>

          <button
            onClick={() => { resetStreak(); advanceOrEnd() }}
            className="text-sm font-semibold text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 px-5 py-2 rounded-full transition-colors"
          >
            Skip →
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
