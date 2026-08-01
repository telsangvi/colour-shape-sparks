import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGameStore } from '../store/gameStore'
import { COLOURS } from '../data/colours'
import { speak } from '../utils/speech'
import { playTap, playCorrect, playWrong } from '../utils/sounds'
import { TimerBar, StreakBadge, ComboFlash, getMilestone, TIMER_TOTAL, RealWorldToast } from './QuizExtras'

const CORRECT_PHRASES = [
  (c: string) => `Yay! That's ${c}!`,
  (c: string) => `Correct! It's ${c}!`,
  (c: string) => `Amazing! The colour is ${c}!`,
  (c: string) => `Yes! ${c} is right!`,
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

export default function ColourQuiz() {
  const { session, currentIndex, recordCorrect, resetStreak, streak, nextQuestion } = useGameStore()
  const item   = session[currentIndex]
  const colour = COLOURS.find(c => c.id === item.colourId)!

  const [options] = useState(() => {
    const others = COLOURS.filter(c => c.id !== colour.id)
    return shuffle([colour, ...shuffle(others).slice(0, 3)])
  })
  const [selected, setSelected]         = useState<string | null>(null)
  const [showResult, setShowResult]     = useState(false)
  const [timeLeft, setTimeLeft]         = useState(TIMER_TOTAL)
  const [combo, setCombo]               = useState<string | null>(null)
  const [toastText, setToastText]       = useState<string | null>(null)

  useEffect(() => { speak('What colour is this?') }, [])

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

  const handleSelect = (colourId: string) => {
    if (selected) return
    playTap()
    const correct = colourId === colour.id
    setSelected(colourId)
    setShowResult(true)

    if (correct) {
      playCorrect()
      const newStreak = streak + 1
      recordCorrect()
      burst(newStreak)
      const milestone = getMilestone(newStreak)
      if (milestone) { setCombo(milestone); setTimeout(() => setCombo(null), 1200) }
      const realWorldItem = pick(colour.realWorld)
      setToastText(`${colour.name} things include ${realWorldItem}`)
      setTimeout(() => setToastText(null), 2000)
      const phrase = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)](colour.name)
      speak(phrase, () => setTimeout(nextQuestion, 300))
    } else {
      playWrong()
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
                  background: i < currentIndex ? '#EC4899' : i === currentIndex ? '#A855F7' : '#E9D5FF' }} />
            ))}
          </div>

          <TimerBar timeLeft={timeLeft} />
          <StreakBadge streak={streak} />

          <p className="text-xl font-extrabold text-gray-700 text-center">What colour is this? 🎨</p>

          {/* Colour swatch */}
          <div className="bg-white rounded-3xl shadow-lg py-5 w-full flex items-center justify-center">
            <motion.div
              className="w-44 h-44 rounded-full shadow-inner"
              style={{ background: colour.hex }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260 }}
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {options.map(opt => {
              const isCorrect  = opt.id === colour.id
              const isSelected = opt.id === selected
              let cls = 'bg-white border-2 border-gray-100 hover:border-purple-200'
              if (showResult && isSelected && isCorrect)  cls = 'bg-green-50 border-2 border-green-400 scale-105'
              if (showResult && isSelected && !isCorrect) cls = 'bg-red-50 border-2 border-red-400 animate-shake'
              if (showResult && !isSelected && isCorrect) cls = 'bg-green-50 border-2 border-green-300'
              return (
                <motion.button
                  key={opt.id}
                  whileTap={!selected ? { scale: 0.94 } : {}}
                  onPointerDown={() => playTap()}
                  onClick={() => handleSelect(opt.id)}
                  disabled={!!selected}
                  className={`rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm ${cls} disabled:cursor-default`}
                >
                  <div className="w-12 h-12 rounded-full flex-shrink-0 shadow-inner"
                    style={{ background: opt.hex }} />
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
