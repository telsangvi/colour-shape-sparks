import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGameStore } from '../store/gameStore'
import { COLOURS } from '../data/colours'
import { speak } from '../utils/speech'

const CORRECT_PHRASES = [
  (c: string) => `Yay! That's ${c}!`,
  (c: string) => `Correct! It's ${c}!`,
  (c: string) => `Amazing! The colour is ${c}!`,
  (c: string) => `Yes! ${c} is right!`,
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function ColourQuiz() {
  const { session, currentIndex, recordCorrect, nextQuestion } = useGameStore()
  const item   = session[currentIndex]
  const colour = COLOURS.find(c => c.id === item.colourId)!

  const [options]     = useState(() => {
    const others = COLOURS.filter(c => c.id !== colour.id)
    return shuffle([colour, ...shuffle(others).slice(0, 3)])
  })
  const [selected, setSelected]     = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    speak('What colour is this?')
  }, [])

  const handleSelect = (colourId: string) => {
    if (selected) return
    const correct = colourId === colour.id
    setSelected(colourId)
    setShowResult(true)

    if (correct) {
      recordCorrect()
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
      const phrase = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)](colour.name)
      speak(phrase, () => setTimeout(nextQuestion, 300))
    } else {
      speak('Try again!')
      setTimeout(() => { setSelected(null); setShowResult(false) }, 700)
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto"
      >
        {/* Progress */}
        <div className="flex gap-1.5 w-full justify-center">
          {session.map((_, i) => (
            <div key={i} className="h-2 rounded-full transition-all duration-300"
              style={{ width: i === currentIndex ? 24 : 14,
                background: i < currentIndex ? '#EC4899' : i === currentIndex ? '#A855F7' : '#E9D5FF' }} />
          ))}
        </div>

        {/* Question */}
        <p className="text-xl font-extrabold text-gray-700 text-center">What colour is this? 🎨</p>

        {/* Colour swatch */}
        <div className="bg-white rounded-3xl shadow-lg p-8 flex items-center justify-center">
          <motion.div
            className="w-36 h-36 rounded-full shadow-inner"
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
                onClick={() => handleSelect(opt.id)}
                disabled={!!selected}
                className={`rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 shadow-sm ${cls} disabled:cursor-default`}
              >
                <div className="w-10 h-10 rounded-full flex-shrink-0 shadow-inner"
                  style={{ background: opt.hex }} />
                <span className="text-sm font-bold text-gray-700">{opt.name}</span>
              </motion.button>
            )
          })}
        </div>

        <button onClick={nextQuestion} className="text-xs text-gray-300 hover:text-gray-400 mt-1">skip →</button>
      </motion.div>
    </AnimatePresence>
  )
}
