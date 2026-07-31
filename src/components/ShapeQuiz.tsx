import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGameStore } from '../store/gameStore'
import { SHAPES } from '../data/shapes'
import { COLOURS } from '../data/colours'
import { speak } from '../utils/speech'
import ShapeDisplay from './ShapeDisplay'

const CORRECT_PHRASES = [
  (s: string) => `Yay! That's a ${s}!`,
  (s: string) => `Correct! It's a ${s}!`,
  (s: string) => `Amazing! A ${s}!`,
  (s: string) => `Yes! That's the ${s}!`,
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function ShapeQuiz() {
  const { session, currentIndex, recordCorrect, setPhase, nextQuestion } = useGameStore()
  const item    = session[currentIndex]
  const shape   = SHAPES.find(s => s.id === item.shapeId)!
  const colour  = COLOURS.find(c => c.id === item.colourId)!

  const [options]     = useState(() => {
    const others = SHAPES.filter(s => s.id !== shape.id)
    return shuffle([shape, ...shuffle(others).slice(0, 3)])
  })
  const [selected, setSelected]     = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    speak(`What shape is this?`)
  }, [])

  const handleSelect = (shapeId: string) => {
    if (selected) return
    const correct = shapeId === shape.id
    setSelected(shapeId)
    setShowResult(true)

    if (correct) {
      recordCorrect()
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
      const phrase = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)](shape.name)
      speak(phrase, () => setPhase('trace'))
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
                background: i < currentIndex ? '#A855F7' : i === currentIndex ? '#EC4899' : '#E9D5FF' }} />
          ))}
        </div>

        {/* Question */}
        <p className="text-xl font-extrabold text-gray-700 text-center">What shape is this? 🔷</p>

        {/* Shape display */}
        <div className="bg-white rounded-3xl shadow-lg p-8 flex items-center justify-center">
          <ShapeDisplay id={shape.id} color={colour.hex} size={140} />
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
                onClick={() => handleSelect(opt.id)}
                disabled={!!selected}
                className={`rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 ${cls} disabled:cursor-default`}
              >
                <ShapeDisplay id={opt.id} color={showResult && isCorrect ? '#22C55E' : '#9CA3AF'} size={52} />
                <span className="text-sm font-bold text-gray-700">{opt.name}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Skip */}
        <button onClick={nextQuestion} className="text-xs text-gray-300 hover:text-gray-400 mt-1">skip →</button>
      </motion.div>
    </AnimatePresence>
  )
}
