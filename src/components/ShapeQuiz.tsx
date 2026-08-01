import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGameStore } from '../store/gameStore'
import { SHAPES } from '../data/shapes'
import { COLOURS } from '../data/colours'
import { speak } from '../utils/speech'
import { playTap, playCorrect, playWrong } from '../utils/sounds'
import ShapeDisplay from './ShapeDisplay'
import { TimerBar, StreakBadge, ComboFlash, getMilestone, TIMER_TOTAL, RealWorldToast } from './QuizExtras'

const CORRECT_PHRASES = [
  (s: string) => `Yay! That's a ${s}!`,
  (s: string) => `Correct! It's a ${s}!`,
  (s: string) => `Amazing! A ${s}!`,
  (s: string) => `Yes! That's the ${s}!`,
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

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

export default function ShapeQuiz() {
  const { session, currentIndex, recordCorrect, resetStreak, streak, setPhase, nextQuestion } = useGameStore()
  const item   = session[currentIndex]
  const shape  = SHAPES.find(s => s.id === item.shapeId)!
  const colour = COLOURS.find(c => c.id === item.colourId)!

  const [options] = useState(() => {
    const others = SHAPES.filter(s => s.id !== shape.id)
    return shuffle([shape, ...shuffle(others).slice(0, 3)])
  })
  const [selected, setSelected]         = useState<string | null>(null)
  const [showResult, setShowResult]     = useState(false)
  const [timeLeft, setTimeLeft]         = useState(TIMER_TOTAL)
  const [combo, setCombo]               = useState<string | null>(null)
  const [toastText, setToastText]       = useState<string | null>(null)
  const [wasWrong, setWasWrong]         = useState(false)

  useEffect(() => { speak('What shape is this?') }, [])

  useEffect(() => {
    if (selected) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); resetStreak(); nextQuestion(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [selected, nextQuestion, resetStreak])

  const handleSelect = (shapeId: string) => {
    if (selected) return
    playTap()
    const correct = shapeId === shape.id
    setSelected(shapeId)
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
      const realWorldItem = pick(shape.realWorld)
      setToastText(`A ${shape.name} looks like ${realWorldItem}`)
      setTimeout(() => setToastText(null), 2000)
      const phrase = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)](shape.name)
      speak(phrase, () => setPhase('trace'))
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
      <RealWorldToast text={toastText} />
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
            {session.map((_, i) => (
              <div key={i} className="h-2 rounded-full transition-all duration-300"
                style={{ width: i === currentIndex ? 24 : 14,
                  background: i < currentIndex ? '#A855F7' : i === currentIndex ? '#EC4899' : '#E9D5FF' }} />
            ))}
          </div>

          <TimerBar timeLeft={timeLeft} />
          <StreakBadge streak={streak} />

          <p className="text-xl font-extrabold text-gray-700 text-center">What shape is this? 🔷</p>

          {/* Shape display */}
          <div className="bg-white rounded-3xl shadow-lg py-5 w-full flex items-center justify-center">
            <ShapeDisplay id={shape.id} color={colour.hex} size={160} />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {options.map(opt => {
              const isCorrect  = opt.id === shape.id
              const isSelected = opt.id === selected
              let cls = 'bg-purple-50 hover:bg-purple-100 border-2 border-purple-100'
              if (showResult && isSelected && isCorrect)  cls = 'bg-green-100 border-2 border-green-400 scale-105'
              if (showResult && isSelected && !isCorrect) cls = 'bg-red-100 border-2 border-red-400 animate-shake'
              if (showResult && !isSelected && isCorrect) cls = 'bg-green-50 border-2 border-green-300'
              return (
                <motion.button
                  key={opt.id}
                  whileTap={!selected ? { scale: 0.94 } : {}}
                  onPointerDown={() => playTap()}
                  onClick={() => handleSelect(opt.id)}
                  disabled={!!selected}
                  className={`rounded-2xl p-3 flex flex-col items-center gap-2 transition-all duration-200 ${cls} disabled:cursor-default`}
                >
                  <ShapeDisplay id={opt.id} color={showResult && isCorrect ? '#22C55E' : '#9CA3AF'} size={62} />
                  <span className="text-base font-bold text-gray-700">{opt.name}</span>
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
