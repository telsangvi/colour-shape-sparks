import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGameStore } from '../store/gameStore'
import { SHAPES } from '../data/shapes'
import { speak } from '../utils/speech'
import { playTap, playCorrect, playWrong } from '../utils/sounds'
import { TimerBar, StreakBadge, ComboFlash, getMilestone, TIMER_TOTAL } from './QuizExtras'

// ─── Scene definitions ────────────────────────────────────────────────────────

interface ShapeCount { shapeId: string; count: number }
interface Scene {
  id: string
  label: string
  shapeCounts: ShapeCount[]
  svg: React.ReactNode
}

const SCENES: Scene[] = [
  {
    id: 'snowman',
    label: 'Snowman',
    shapeCounts: [{ shapeId: 'circle', count: 3 }],
    svg: (
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        {/* Body circles */}
        <circle cx="100" cy="55"  r="38" fill="white" stroke="#9CA3AF" strokeWidth="2" />
        <circle cx="100" cy="130" r="50" fill="white" stroke="#9CA3AF" strokeWidth="2" />
        <circle cx="100" cy="195" r="22" fill="white" stroke="#9CA3AF" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="91"  cy="48"  r="4" fill="#1F2937" />
        <circle cx="109" cy="48"  r="4" fill="#1F2937" />
        {/* Nose */}
        <polygon points="100,55 107,68 93,68" fill="#F97316" />
        {/* Arms */}
        <line x1="50" y1="120" x2="18" y2="100" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
        <line x1="150" y1="120" x2="182" y2="100" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'traffic-light',
    label: 'Traffic Light',
    shapeCounts: [{ shapeId: 'circle', count: 3 }, { shapeId: 'rectangle', count: 1 }],
    svg: (
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        {/* Box */}
        <rect x="60" y="10" width="80" height="200" rx="12" fill="#374151" />
        {/* Red */}
        <circle cx="100" cy="50"  r="24" fill="#EF4444" />
        {/* Yellow */}
        <circle cx="100" cy="110" r="24" fill="#EAB308" />
        {/* Green */}
        <circle cx="100" cy="170" r="24" fill="#22C55E" />
      </svg>
    ),
  },
  {
    id: 'house',
    label: 'House',
    shapeCounts: [{ shapeId: 'triangle', count: 1 }, { shapeId: 'rectangle', count: 4 }],
    svg: (
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        {/* House body */}
        <rect x="30" y="100" width="140" height="110" rx="4" fill="#FB923C" />
        {/* Roof */}
        <polygon points="100,10 180,105 20,105" fill="#DC2626" />
        {/* Door */}
        <rect x="80" y="165" width="40" height="45" rx="3" fill="#92400E" />
        {/* Windows */}
        <rect x="38" y="118" width="38" height="32" rx="3" fill="#FEF08A" />
        <rect x="124" y="118" width="38" height="32" rx="3" fill="#FEF08A" />
      </svg>
    ),
  },
  {
    id: 'mountains',
    label: 'Mountains',
    shapeCounts: [{ shapeId: 'triangle', count: 3 }],
    svg: (
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        {/* Sky */}
        <rect x="0" y="0" width="200" height="220" fill="#BFDBFE" />
        {/* Left mountain */}
        <polygon points="30,200 90,60 150,200"  fill="#6B7280" />
        {/* Middle mountain (tallest) */}
        <polygon points="70,200 120,20 170,200" fill="#4B5563" />
        {/* Right mountain */}
        <polygon points="110,200 165,70 200,200" fill="#9CA3AF" />
        {/* Snow caps */}
        <polygon points="90,60  110,105 70,105"  fill="white" />
        <polygon points="120,20 138,65  102,65"  fill="white" />
        <polygon points="165,70 178,105 152,105" fill="white" />
        {/* Ground */}
        <rect x="0" y="196" width="200" height="24" fill="#6EE7B7" />
      </svg>
    ),
  },
]

// ─── Session builder ──────────────────────────────────────────────────────────

const SESSION_LENGTH = 6

interface SpotterQuestion {
  scene: Scene
  shapeId: string
  shapeName: string
  answer: number
  options: number[]
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

function buildSession(): SpotterQuestion[] {
  const qs: SpotterQuestion[] = []
  for (let i = 0; i < SESSION_LENGTH; i++) {
    const scene = SCENES[i % SCENES.length]
    const sc = scene.shapeCounts[Math.floor(Math.random() * scene.shapeCounts.length)]
    const shapeName = SHAPES.find(s => s.id === sc.shapeId)?.name ?? sc.shapeId
    const answer = sc.count
    const others = new Set<number>()
    while (others.size < 3) {
      const candidate = Math.max(1, answer + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1))
      if (candidate !== answer) others.add(candidate)
    }
    const options = shuffle([answer, ...Array.from(others)])
    qs.push({ scene, shapeId: sc.shapeId, shapeName, answer, options })
  }
  return shuffle(qs)
}

// ─── Number button colours ────────────────────────────────────────────────────

const OPTION_STYLES = [
  'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200',
  'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200',
  'bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-200',
  'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200',
]

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

const PHRASES = [
  "Yay! That's right!", 'Correct! Well done!', 'Amazing! Great job!',
  'Yes! You got it!', 'Brilliant!',
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShapeSpotter() {
  const { recordCorrect, resetStreak, streak, setPhase } = useGameStore()

  const [questions]                 = useState(() => buildSession())
  const [qIndex, setQIndex]         = useState(0)
  const [selected, setSelected]     = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft]     = useState(TIMER_TOTAL)
  const [combo, setCombo]           = useState<string | null>(null)
  const [wasWrong, setWasWrong]     = useState(false)

  const q = questions[qIndex]

  useEffect(() => { speak(`How many ${q.shapeName}s can you count?`) }, [qIndex])  // eslint-disable-line react-hooks/exhaustive-deps

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
    setWasWrong(false)
    if (qIndex + 1 >= SESSION_LENGTH) {
      setPhase('summary')
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setShowResult(false)
      setTimeLeft(TIMER_TOTAL)
    }
  }

  const handleSelect = (val: number, idx: number) => {
    if (selected !== null) return
    playTap()
    const correct = val === q.answer
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
      speak(phrase, () => setTimeout(advanceOrEnd, 300))
    } else {
      playWrong()
      setWasWrong(true)
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
                  background: i < qIndex ? '#3B82F6' : i === qIndex ? '#EC4899' : '#BFDBFE' }} />
            ))}
          </div>

          <TimerBar timeLeft={timeLeft} />
          <StreakBadge streak={streak} />

          <p className="text-xl font-extrabold text-gray-700 text-center">
            How many {q.shapeName}s can you count? 🔍
          </p>

          {/* Scene card */}
          <div className="bg-white rounded-3xl shadow-lg w-full overflow-hidden" style={{ height: 192 }}>
            {q.scene.svg}
          </div>

          {/* Number options */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {q.options.map((val, idx) => {
              const isAnswer   = val === q.answer
              const isSelected = idx === selected
              let base = OPTION_STYLES[idx % OPTION_STYLES.length]
              let cls = `${base} border-2`
              if (showResult && isSelected && isAnswer)   cls = 'bg-green-100 border-2 border-green-400 text-green-700 scale-105'
              if (showResult && isSelected && !isAnswer)  cls = 'bg-red-100 border-2 border-red-400 text-red-700 animate-shake'
              if (showResult && !isSelected && isAnswer)  cls = 'bg-green-50 border-2 border-green-300 text-green-600'
              return (
                <motion.button
                  key={idx}
                  whileTap={selected === null ? { scale: 0.94 } : {}}
                  onPointerDown={() => playTap()}
                  onClick={() => handleSelect(val, idx)}
                  disabled={selected !== null}
                  className={`rounded-2xl p-4 flex items-center justify-center transition-all duration-200 ${cls} disabled:cursor-default`}
                >
                  <span className="text-4xl font-extrabold">{val}</span>
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
