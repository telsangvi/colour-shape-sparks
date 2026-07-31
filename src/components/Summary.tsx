import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { speak } from '../utils/speech'

export default function Summary() {
  const { score, session, mode, startSession, goIdle } = useGameStore()
  const total = session.length
  const pct   = Math.round((score / total) * 100)

  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
    speak(`Well done! You got ${score} out of ${total}!`)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto text-center"
    >
      <div className="text-6xl">🎉</div>
      <h2 className="text-3xl font-extrabold text-purple-600">Great job!</h2>

      {/* Score ring */}
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#E9D5FF" strokeWidth="12" />
          <motion.circle
            cx="60" cy="60" r="50" fill="none"
            stroke="#A855F7" strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
            initial={{ strokeDashoffset: `${2 * Math.PI * 50}` }}
            animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - pct / 100)}` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-purple-600">{pct}%</span>
          <span className="text-xs text-gray-400">{score}/{total}</span>
        </div>
      </div>

      <div className="flex gap-3 w-full">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => startSession(mode!)}
          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-extrabold py-4 rounded-2xl text-base shadow-lg transition-colors"
        >
          Play Again 🔄
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goIdle}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold py-4 rounded-2xl text-base shadow transition-colors"
        >
          Menu 🏠
        </motion.button>
      </div>
    </motion.div>
  )
}
