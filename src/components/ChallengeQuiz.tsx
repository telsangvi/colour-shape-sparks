import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGameStore } from '../store/gameStore'
import { SHAPES } from '../data/shapes'
import { COLOURS } from '../data/colours'
import { speak } from '../utils/speech'
import ShapeDisplay from './ShapeDisplay'

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionType = 'combined' | 'reverse-shape' | 'reverse-colour' | 'odd-one-out'

interface Option { shapeId: string; colourId: string }

interface ChallengeQuestion {
  type:        QuestionType
  prompt:      string
  options:     Option[]
  answerIndex: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }
function pick<T>(arr: T[]): T      { return arr[Math.floor(Math.random() * arr.length)] }

// ─── Question builders ────────────────────────────────────────────────────────

function buildCombined(): ChallengeQuestion {
  const ts = pick(SHAPES);  const tc = pick(COLOURS)
  const os = shuffle(SHAPES.filter(s => s.id !== ts.id))
  const oc = shuffle(COLOURS.filter(c => c.id !== tc.id))

  const opts = shuffle([
    { shapeId: ts.id,    colourId: tc.id    },   // correct
    { shapeId: ts.id,    colourId: oc[0].id },   // same shape, wrong colour
    { shapeId: os[0].id, colourId: tc.id    },   // wrong shape, same colour
    { shapeId: os[1].id, colourId: oc[1].id },   // wrong shape, wrong colour
  ])

  return {
    type: 'combined',
    prompt: `Tap the ${tc.name.toLowerCase()} ${ts.name.toLowerCase()}!`,
    options: opts,
    answerIndex: opts.findIndex(o => o.shapeId === ts.id && o.colourId === tc.id),
  }
}

function buildReverseShape(): ChallengeQuestion {
  const ts   = pick(SHAPES)
  const rest = shuffle(SHAPES.filter(s => s.id !== ts.id)).slice(0, 3)
  const all  = shuffle([ts, ...rest])
  const opts = all.map(s => ({ shapeId: s.id, colourId: pick(COLOURS).id }))

  return {
    type: 'reverse-shape',
    prompt: `Which one is a ${ts.name.toLowerCase()}?`,
    options: opts,
    answerIndex: all.findIndex(s => s.id === ts.id),
  }
}

function buildReverseColour(): ChallengeQuestion {
  const tc   = pick(COLOURS)
  const rest = shuffle(COLOURS.filter(c => c.id !== tc.id)).slice(0, 3)
  const all  = shuffle([tc, ...rest])
  const opts = all.map(c => ({ shapeId: 'circle', colourId: c.id }))

  return {
    type: 'reverse-colour',
    prompt: `Which one is ${tc.name.toLowerCase()}?`,
    options: opts,
    answerIndex: all.findIndex(c => c.id === tc.id),
  }
}

function buildOddOneOut(): ChallengeQuestion {
  if (Math.random() < 0.5) {
    // 3 same shape, 1 different shape
    const major = pick(SHAPES)
    const odd   = pick(SHAPES.filter(s => s.id !== major.id))
    const cols  = shuffle(COLOURS).slice(0, 4)
    const oddAt = Math.floor(Math.random() * 4)
    const opts  = cols.map((c, i) => ({ shapeId: i === oddAt ? odd.id : major.id, colourId: c.id }))

    return { type: 'odd-one-out', prompt: 'Which one is different?', options: opts, answerIndex: oddAt }
  } else {
    // 3 same colour, 1 different colour
    const major = pick(COLOURS)
    const odd   = pick(COLOURS.filter(c => c.id !== major.id))
    const shps  = shuffle(SHAPES).slice(0, 4)
    const oddAt = Math.floor(Math.random() * 4)
    const opts  = shps.map((s, i) => ({ shapeId: s.id, colourId: i === oddAt ? odd.id : major.id }))

    return { type: 'odd-one-out', prompt: 'Which one is different?', options: opts, answerIndex: oddAt }
  }
}

const BUILDERS = [buildCombined, buildCombined, buildReverseShape, buildReverseColour, buildOddOneOut]

function buildSession(n: number): ChallengeQuestion[] {
  return Array.from({ length: n }, (_, i) => BUILDERS[i % BUILDERS.length]())
    .sort(() => Math.random() - 0.5)
}

// ─── Correct phrases ──────────────────────────────────────────────────────────

const PHRASES = [
  'Yay! That\'s right!',
  'Correct! Well done!',
  'Amazing! Great job!',
  'Yes! You got it!',
  'Brilliant! Keep going!',
]

// ─── Component ────────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<QuestionType, string> = {
  'combined':       '🎨 + 🔷',
  'reverse-shape':  '🔷 Find it',
  'reverse-colour': '🌈 Find it',
  'odd-one-out':    '🔍 Odd one out',
}

export default function ChallengeQuiz() {
  const { session, currentIndex, recordCorrect, nextQuestion } = useGameStore()

  const [questions]   = useState(() => buildSession(session.length || 10))
  const [selected, setSelected]     = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const q = questions[currentIndex] ?? questions[0]

  useEffect(() => {
    speak(q.prompt)
  }, [currentIndex])

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    const correct = idx === q.answerIndex
    setSelected(idx)
    setShowResult(true)

    if (correct) {
      recordCorrect()
      confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } })
      const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
      speak(phrase, () => setTimeout(nextQuestion, 300))
    } else {
      speak('Try again!')
      setTimeout(() => { setSelected(null); setShowResult(false) }, 700)
    }
  }

  const colour = (id: string) => COLOURS.find(c => c.id === id)!.hex

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto"
      >
        {/* Progress */}
        <div className="flex gap-1.5 w-full justify-center">
          {questions.map((_, i) => (
            <div key={i} className="h-2 rounded-full transition-all duration-300"
              style={{ width: i === currentIndex ? 24 : 14,
                background: i < currentIndex ? '#F97316' : i === currentIndex ? '#EC4899' : '#FDE68A' }} />
          ))}
        </div>

        {/* Type badge */}
        <span className="text-xs font-bold text-orange-400 bg-orange-50 px-3 py-1 rounded-full">
          {TYPE_BADGE[q.type]}
        </span>

        {/* Prompt */}
        <p className="text-xl font-extrabold text-gray-700 text-center">{q.prompt}</p>

        {/* Options grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {q.options.map((opt, idx) => {
            const isCorrect  = idx === q.answerIndex
            const isSelected = idx === selected
            let cls = 'bg-white border-2 border-gray-100 hover:border-orange-200 hover:shadow'
            if (showResult && isSelected && isCorrect)  cls = 'bg-green-50 border-2 border-green-400 scale-105'
            if (showResult && isSelected && !isCorrect) cls = 'bg-red-50 border-2 border-red-400 animate-shake'
            if (showResult && !isSelected && isCorrect) cls = 'bg-green-50 border-2 border-green-300'

            return (
              <motion.button
                key={idx}
                whileTap={selected === null ? { scale: 0.94 } : {}}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={`rounded-2xl p-4 flex items-center justify-center transition-all duration-200 ${cls} disabled:cursor-default`}
              >
                <ShapeDisplay id={opt.shapeId} color={colour(opt.colourId)} size={72} />
              </motion.button>
            )
          })}
        </div>

        <button onClick={nextQuestion} className="text-xs text-gray-300 hover:text-gray-400">skip →</button>
      </motion.div>
    </AnimatePresence>
  )
}
