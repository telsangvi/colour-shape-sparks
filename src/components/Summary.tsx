import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { speak } from '../utils/speech'

function stars(pct: number) {
  if (pct >= 80) return 3
  if (pct >= 50) return 2
  return 1
}

export default function Summary() {
  const { score, session, maxStreak, mode, startSession, goIdle } = useGameStore()
  const total   = session.length
  const pct     = Math.round((score / total) * 100)
  const starCount = stars(pct)

  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
    const msg = starCount === 3
      ? `Wow! Perfect! You got ${score} out of ${total}!`
      : `Well done! You got ${score} out of ${total}!`
    speak(msg)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto text-center"
    >
      <div className="text-6xl">🎉</div>
      <h2 className="text-3xl font-extrabold text-purple-600">
        {starCount === 3 ? 'Perfect!' : starCount === 2 ? 'Great job!' : 'Keep going!'}
      </h2>

      {/* Stars */}
      <div className="flex gap-2">
        {[1, 2, 3].map(n => (
          <motion.span
            key={n}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: n <= starCount ? 1 : 0.6, rotate: 0, opacity: n <= starCount ? 1 : 0.25 }}
            transition={{ delay: n * 0.15, type: 'spring', stiffness: 260 }}
            className="text-5xl"
          >
            ⭐
          </motion.span>
        ))}
      </div>

      {/* Score ring */}
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#E9D5FF" strokeWidth="12" />
          <motion.circle
            cx="60" cy="60" r="50" fill="none"
            stroke="#A855F7" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
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

      {/* Max streak */}
      {maxStreak >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 bg-orange-50 text-orange-500 font-extrabold px-4 py-2 rounded-2xl text-sm"
        >
          🔥 Best streak: {maxStreak} in a row!
        </motion.div>
      )}

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
