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
        <rect x="0" y="0" width="200" height="220" fill="#BFDBFE" />
        <polygon points="30,200 90,60 150,200"  fill="#6B7280" />
        <polygon points="70,200 120,20 170,200" fill="#4B5563" />
        <polygon points="110,200 165,70 200,200" fill="#9CA3AF" />
        <polygon points="90,60  110,105 70,105"  fill="white" />
        <polygon points="120,20 138,65  102,65"  fill="white" />
        <polygon points="165,70 178,105 152,105" fill="white" />
        <rect x="0" y="196" width="200" height="24" fill="#6EE7B7" />
      </svg>
    ),
  },
  {
    id: 'ice-cream',
    label: 'Ice Cream',
    shapeCounts: [{ shapeId: 'circle', count: 2 }, { shapeId: 'triangle', count: 1 }],
    svg: (
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        {/* Cone (triangle) */}
        <polygon points="100,218 52,112 148,112" fill="#D97706" />
        <line x1="100" y1="218" x2="76" y2="128"  stroke="#B45309" strokeWidth="2" />
        <line x1="100" y1="218" x2="124" y2="128" stroke="#B45309" strokeWidth="2" />
        <line x1="63"  y1="156" x2="137" y2="156" stroke="#B45309" strokeWidth="1.5" />
        <line x1="56"  y1="180" x2="144" y2="180" stroke="#B45309" strokeWidth="1.5" />
        {/* Pink scoop (circle 1) */}
        <circle cx="78"  cy="90" r="40" fill="#FBCFE8" stroke="#F9A8D4" strokeWidth="2" />
        {/* Yellow scoop (circle 2) */}
        <circle cx="124" cy="86" r="38" fill="#FEF08A" stroke="#FDE047" strokeWidth="2" />
        {/* Sprinkles */}
        <rect x="54" y="76" width="14" height="5" rx="2" fill="#EF4444" transform="rotate(-20 54 76)" />
        <rect x="94" y="60" width="14" height="5" rx="2" fill="#3B82F6" transform="rotate(15 94 60)" />
        <rect x="118" y="70" width="14" height="5" rx="2" fill="#22C55E" transform="rotate(-10 118 70)" />
      </svg>
    ),
  },
  {
    id: 'robot',
    label: 'Robot',
    shapeCounts: [{ shapeId: 'rectangle', count: 4 }, { shapeId: 'circle', count: 2 }],
    svg: (
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        {/* Antenna */}
        <line x1="100" y1="6" x2="100" y2="28" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
        <line x1="84"  y1="14" x2="116" y2="14" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
        {/* Head (rect 1) */}
        <rect x="50" y="28" width="100" height="72" rx="10" fill="#9CA3AF" stroke="#6B7280" strokeWidth="2" />
        {/* Eyes (circle 1 & 2) */}
        <circle cx="78"  cy="58" r="18" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="2" />
        <circle cx="122" cy="58" r="18" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="2" />
        <circle cx="78"  cy="58" r="8"  fill="#1D4ED8" />
        <circle cx="122" cy="58" r="8"  fill="#1D4ED8" />
        {/* Smile */}
        <path d="M 76 84 Q 100 96 124 84" stroke="#374151" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Body (rect 2) */}
        <rect x="38" y="108" width="124" height="82" rx="10" fill="#6B7280" stroke="#4B5563" strokeWidth="2" />
        <rect x="68" y="125" width="64" height="44" rx="6" fill="#4B5563" />
        <circle cx="100" cy="147" r="12" fill="#EF4444" />
        {/* Left arm (rect 3) */}
        <rect x="4"   y="114" width="32" height="18" rx="9" fill="#6B7280" stroke="#4B5563" strokeWidth="2" />
        {/* Right arm (rect 4) */}
        <rect x="164" y="114" width="32" height="18" rx="9" fill="#6B7280" stroke="#4B5563" strokeWidth="2" />
        {/* Feet */}
        <ellipse cx="78"  cy="200" rx="22" ry="12" fill="#4B5563" />
        <ellipse cx="122" cy="200" rx="22" ry="12" fill="#4B5563" />
      </svg>
    ),
  },
  {
    id: 'caterpillar',
    label: 'Caterpillar',
    shapeCounts: [{ shapeId: 'circle', count: 5 }],
    svg: (
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <rect x="0" y="160" width="200" height="60" fill="#86EFAC" />
        {/* Body segments (circles 1-4) */}
        <circle cx="24"  cy="148" r="22" fill="#4ADE80" stroke="#16A34A" strokeWidth="2" />
        <circle cx="64"  cy="143" r="24" fill="#86EFAC" stroke="#16A34A" strokeWidth="2" />
        <circle cx="106" cy="140" r="24" fill="#4ADE80" stroke="#16A34A" strokeWidth="2" />
        <circle cx="148" cy="143" r="24" fill="#86EFAC" stroke="#16A34A" strokeWidth="2" />
        {/* Head (circle 5) */}
        <circle cx="184" cy="132" r="26" fill="#22C55E" stroke="#16A34A" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="177" cy="125" r="5" fill="white" />
        <circle cx="191" cy="125" r="5" fill="white" />
        <circle cx="177" cy="126" r="2.5" fill="#1F2937" />
        <circle cx="191" cy="126" r="2.5" fill="#1F2937" />
        {/* Smile */}
        <path d="M 176 136 Q 184 142 192 136" stroke="#15803D" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Antennae */}
        <line x1="180" y1="108" x2="170" y2="92" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
        <line x1="188" y1="108" x2="198" y2="92" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="170" cy="90" r="4" fill="#16A34A" />
        <circle cx="198" cy="90" r="4" fill="#16A34A" />
      </svg>
    ),
  },
  {
    id: 'night-sky',
    label: 'Night Sky',
    shapeCounts: [{ shapeId: 'star', count: 4 }],
    svg: (
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <rect x="0" y="0" width="200" height="220" fill="#1E3A5F" />
        {/* Moon */}
        <circle cx="162" cy="38" r="26" fill="#FEF08A" />
        <circle cx="172" cy="30" r="20" fill="#1E3A5F" />
        {/* Star 1 at (45,55) R=18 */}
        <polygon points="45,37 49.1,49.3 62.1,49.4 51.7,57.2 55.6,69.6 45,62 34.4,69.6 38.3,57.2 27.9,49.4 40.9,49.3" fill="#FCD34D" />
        {/* Star 2 at (130,35) R=16 */}
        <polygon points="130,19 133.8,29.8 145.2,30.1 136.2,37 139.4,48.2 130,42.5 120.6,48.2 123.8,37 114.8,30.1 126.2,29.8" fill="#FCD34D" />
        {/* Star 3 at (38,155) R=14 */}
        <polygon points="38,141 41.3,150.5 51.3,150.7 43.7,156.9 46.4,166.6 38,161.4 29.6,166.6 32.3,156.9 24.7,150.7 34.7,150.5" fill="#FCD34D" />
        {/* Star 4 at (158,148) R=15 */}
        <polygon points="158,133 161.5,143.5 172.3,143.7 164.1,150.2 167,160.2 158,154.8 149,160.2 151.9,150.2 143.7,143.7 154.5,143.5" fill="#FCD34D" />
        {/* Ground / hills */}
        <ellipse cx="50"  cy="220" rx="80"  ry="30" fill="#1A3A1A" />
        <ellipse cx="160" cy="220" rx="70"  ry="25" fill="#1A3A1A" />
      </svg>
    ),
  },
  {
    id: 'flower',
    label: 'Flower',
    shapeCounts: [{ shapeId: 'circle', count: 6 }],
    svg: (
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        {/* Stem */}
        <line x1="100" y1="138" x2="100" y2="215" stroke="#16A34A" strokeWidth="8" strokeLinecap="round" />
        {/* Leaves */}
        <ellipse cx="82" cy="185" rx="18" ry="9" fill="#22C55E" transform="rotate(-30 82 185)" />
        <ellipse cx="118" cy="170" rx="18" ry="9" fill="#22C55E" transform="rotate(30 118 170)" />
        {/* Petals (circles 1-5) at 72° intervals */}
        <circle cx="148" cy="112" r="26" fill="#FB923C" />
        <circle cx="115" cy="157" r="26" fill="#FBBF24" />
        <circle cx="68"  cy="152" r="26" fill="#FB923C" />
        <circle cx="55"  cy="106" r="26" fill="#FBBF24" />
        <circle cx="95"  cy="68"  r="26" fill="#FB923C" />
        {/* Centre (circle 6) */}
        <circle cx="100" cy="112" r="30" fill="#FEF08A" stroke="#FDE047" strokeWidth="2" />
        <circle cx="100" cy="112" r="12" fill="#F59E0B" />
      </svg>
    ),
  },
  {
    id: 'beehive',
    label: 'Beehive',
    shapeCounts: [{ shapeId: 'hexagon', count: 7 }],
    svg: (
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <rect x="0" y="0" width="200" height="220" fill="#FEF3C7" />
        {/* 7 hexagons in honeycomb: center + 6 surrounding, r=24 flat-top */}
        {/* Center */}
        <polygon points="124,112 112,132.8 88,132.8 76,112 88,91.2 112,91.2" fill="#FCD34D" stroke="#D97706" strokeWidth="2" />
        {/* Right */}
        <polygon points="165.6,112 153.6,132.8 129.6,132.8 117.6,112 129.6,91.2 153.6,91.2" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
        {/* Lower-right */}
        <polygon points="144.8,148 132.8,168.8 108.8,168.8 96.8,148 108.8,127.2 132.8,127.2" fill="#FCD34D" stroke="#D97706" strokeWidth="2" />
        {/* Lower-left */}
        <polygon points="103.2,148 91.2,168.8 67.2,168.8 55.2,148 67.2,127.2 91.2,127.2" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
        {/* Left */}
        <polygon points="82.4,112 70.4,132.8 46.4,132.8 34.4,112 46.4,91.2 70.4,91.2" fill="#FCD34D" stroke="#D97706" strokeWidth="2" />
        {/* Upper-left */}
        <polygon points="103.2,76 91.2,96.8 67.2,96.8 55.2,76 67.2,55.2 91.2,55.2" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
        {/* Upper-right */}
        <polygon points="144.8,76 132.8,96.8 108.8,96.8 96.8,76 108.8,55.2 132.8,55.2" fill="#FCD34D" stroke="#D97706" strokeWidth="2" />
        {/* Bee */}
        <ellipse cx="168" cy="185" rx="12" ry="8" fill="#FCD34D" />
        <line x1="160" y1="185" x2="176" y2="185" stroke="#1F2937" strokeWidth="1.5" />
        <line x1="162" y1="185" x2="176" y2="185" stroke="#1F2937" strokeWidth="1.5" />
        <ellipse cx="158" cy="180" rx="9" ry="5" fill="white" opacity="0.7" transform="rotate(-30 158 180)" />
        <ellipse cx="164" cy="178" rx="9" ry="5" fill="white" opacity="0.7" transform="rotate(20 164 178)" />
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
  const picked = shuffle([...SCENES]).slice(0, SESSION_LENGTH)
  return picked.map(scene => {
    const sc = scene.shapeCounts[Math.floor(Math.random() * scene.shapeCounts.length)]
    const shapeName = SHAPES.find(s => s.id === sc.shapeId)?.name ?? sc.shapeId
    const answer = sc.count
    const others = new Set<number>()
    while (others.size < 3) {
      const candidate = Math.max(1, answer + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1))
      if (candidate !== answer) others.add(candidate)
    }
    const options = shuffle([answer, ...Array.from(others)])
    return { scene, shapeId: sc.shapeId, shapeName, answer, options }
  })
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
