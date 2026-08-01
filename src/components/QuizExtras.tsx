import { motion, AnimatePresence } from 'framer-motion'

export const TIMER_TOTAL = 12

export function RealWorldToast({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl px-5 py-3 text-sm font-bold text-gray-700 whitespace-nowrap"
        >
          💡 Did you know? {text}!
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function TimerBar({ timeLeft }: { timeLeft: number }) {
  const pct   = timeLeft / TIMER_TOTAL
  const color = pct > 0.5 ? '#22C55E' : pct > 0.25 ? '#EAB308' : '#EF4444'
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct * 100}%`, background: color }}
      />
    </div>
  )
}

export function StreakBadge({ streak }: { streak: number }) {
  const fires = streak >= 5 ? '🔥🔥🔥' : streak >= 3 ? '🔥🔥' : '🔥'
  return (
    <div className="h-8 flex items-center justify-center">
      <AnimatePresence>
        {streak >= 2 && (
          <motion.div
            key={streak}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            className="flex items-center gap-1 bg-orange-100 text-orange-500 font-extrabold px-3 py-0.5 rounded-full text-sm"
          >
            {fires} {streak} in a row!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ComboFlash({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        >
          <span className="text-5xl font-extrabold text-orange-500 drop-shadow-lg">{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const MILESTONES: Record<number, string> = { 3: '🔥 Triple!', 5: '⚡ On fire!', 8: '🌟 Unstoppable!' }
export function getMilestone(n: number) { return MILESTONES[n] ?? null }
