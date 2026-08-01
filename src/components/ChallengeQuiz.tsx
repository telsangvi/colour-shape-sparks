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

function buildCombined(): ChallengeQuestion {
  const ts = pick(SHAPES);  const tc = pick(COLOURS)
  const os = shuffle(SHAPES.filter(s => s.id !== ts.id))
  const oc = shuffle(COLOURS.filter(c => c.id !== tc.id))
  const opts = shuffle([
    { shapeId: ts.id,    colourId: tc.id    },
    { shapeId: ts.id,    colourId: oc[0].id },
    { shapeId: os[0].id, colourId: tc.id    },
    { shapeId: os[1].id, colourId: oc[1].id },
  ])
  return { type: 'combined', prompt: `Tap the ${tc.name.toLowerCase()} ${ts.name.toLowerCase()}!`,
    options: opts, answerIndex: opts.findIndex(o => o.shapeId === ts.id && o.colourId === tc.id) }
}

function buildReverseShape(): ChallengeQuestion {
  const ts   = pick(SHAPES)
  const rest = shuffle(SHAPES.filter(s => s.id !== ts.id)).slice(0, 3)
  const all  = shuffle([ts, ...rest])
  const opts = all.map(s => ({ shapeId: s.id, colourId: pick(COLOURS).id }))
  return { type: 'reverse-shape', prompt: `Which one is a ${ts.name.toLowerCase()}?`,
    options: opts, answerIndex: all.findIndex(s => s.id === ts.id) }
}

function buildReverseColour(): ChallengeQuestion {
  const tc   = pick(COLOURS)
  const rest = shuffle(COLOURS.filter(c => c.id !== tc.id)).slice(0, 3)
  const all  = shuffle([tc, ...rest])
  const opts = all.map(c => ({ shapeId: 'circle', colourId: c.id }))
  return { type: 'reverse-colour', prompt: `Which one is ${tc.name.toLowerCase()}?`,
    options: opts, answerIndex: all.findIndex(c => c.id === tc.id) }
}

function buildOddOneOut(): ChallengeQuestion {
  if (Math.random() < 0.5) {
    const major = pick(SHAPES); const odd = pick(SHAPES.filter(s => s.id !== major.id))
    const cols  = shuffle(COLOURS).slice(0, 4); const oddAt = Math.floor(Math.random() * 4)
    const opts  = cols.map((c, i) => ({ shapeId: i === oddAt ? odd.id : major.id, colourId: c.id }))
    return { type: 'odd-one-out', prompt: 'Which one is different?', options: opts, answerIndex: oddAt }
  } else {
    const major = pick(COLOURS); const odd = pick(COLOURS.filter(c => c.id !== major.id))
    const shps  = shuffle(SHAPES).slice(0, 4); const oddAt = Math.floor(Math.random() * 4)
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
  "Yay! That's right!", 'Correct! Well done!', 'Amazing! Great job!',
  'Yes! You got it!', 'Brilliant! Keep going!',
]

const TYPE_BADGE: Record<QuestionType, string> = {
  'combined':       '🎨 + 🔷',
  'reverse-shape':  '🔷 Find it',
  'reverse-colour': '🌈 Find it',
  'odd-one-out':    '🔍 Odd one out',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChallengeQuiz() {
  const { session, currentIndex, recordCorrect, resetStreak, streak, nextQuestion } = useGameStore()

  const [questions]                 = useState(() => buildSession(session.length || 10))
  const [selected, setSelected]     = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft]     = useState(TIMER_TOTAL)
  const [combo, setCombo]           = useState<string | null>(null)
  const [wasWrong, setWasWrong]     = useState(false)

  const q = questions[currentIndex] ?? questions[0]

  useEffect(() => { speak(q.prompt) }, [currentIndex])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selected !== null) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); resetStreak(); nextQuestion(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [selected, nextQuestion, resetStreak])

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    playTap()
    const correct = idx === q.answerIndex
    setSelected(idx)
    setShowResult(true)

    if (correct) {
      playCorrect()
      if (!wasWrong) {
        const newStreak = streak + 1
        recordCorrect()
        burst(newStreak)
        const milestone = getMilestone(newStreak)
        if (milestone) { setCombo(milestone); setTimeout(() => setCombo(null), 1200) }
      }
      const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
      speak(phrase, () => setTimeout(nextQuestion, 300))
    } else {
      playWrong()
      setWasWrong(true)
      resetStreak()
      speak('Try again!')
      setTimeout(() => { setSelected(null); setShowResult(false) }, 700)
    }
  }

  const colour = (id: string) => COLOURS.find(c => c.id === id)!.hex

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <ComboFlash text={combo} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex flex-col items-center gap-3 w-full"
        >
          {/* Progress */}
          <div className="flex gap-1.5 w-full justify-center">
            {questions.map((_, i) => (
              <div key={i} className="h-2 rounded-full transition-all duration-300"
                style={{ width: i === currentIndex ? 24 : 14,
                  background: i < currentIndex ? '#F97316' : i === currentIndex ? '#EC4899' : '#FDE68A' }} />
            ))}
          </div>

          <TimerBar timeLeft={timeLeft} />
          <StreakBadge streak={streak} />

          <span className="text-xs font-bold text-orange-400 bg-orange-50 px-3 py-1 rounded-full">
            {TYPE_BADGE[q.type]}
          </span>

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
                  onPointerDown={() => playTap()}
                  onClick={() => handleSelect(idx)}
                  disabled={selected !== null}
                  className={`rounded-2xl p-4 flex items-center justify-center transition-all duration-200 ${cls} disabled:cursor-default`}
                >
                  <ShapeDisplay id={opt.shapeId} color={colour(opt.colourId)} size={76} />
                </motion.button>
              )
            })}
          </div>

          <button
            onClick={() => { resetStreak(); nextQuestion() }}
            className="text-sm font-semibold text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 px-5 py-2 rounded-full transition-colors"
          >
            Skip →
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
