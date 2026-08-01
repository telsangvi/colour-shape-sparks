import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useGameStore } from './store/gameStore'
import { startAmbient, stopAmbient } from './utils/ambientMusic'
import ShapeQuiz from './components/ShapeQuiz'
import ColourQuiz from './components/ColourQuiz'
import ChallengeQuiz from './components/ChallengeQuiz'
import ShapeTrace from './components/ShapeTrace'
import Summary from './components/Summary'
import './index.css'

function ModeSelect() {
  const { startSession } = useGameStore()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto text-center"
    >
      <div className="text-5xl">🎨</div>
      <div>
        <h1 className="text-3xl font-extrabold text-purple-600 leading-tight">Colour & Shape Sparks</h1>
        <p className="text-gray-400 text-sm mt-1">Pick a mode to start learning!</p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => startSession('shapes')}
          className="bg-purple-500 hover:bg-purple-600 text-white font-extrabold py-6 rounded-3xl text-xl shadow-lg transition-colors flex flex-col items-center gap-1"
        >
          <span className="text-4xl">🔷</span>
          <span>Shapes</span>
          <span className="text-sm font-semibold opacity-80">Learn circles, squares & more</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => startSession('colours')}
          className="bg-pink-500 hover:bg-pink-600 text-white font-extrabold py-6 rounded-3xl text-xl shadow-lg transition-colors flex flex-col items-center gap-1"
        >
          <span className="text-4xl">🌈</span>
          <span>Colours</span>
          <span className="text-sm font-semibold opacity-80">Learn red, blue, green & more</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => startSession('challenge')}
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-extrabold py-6 rounded-3xl text-xl shadow-lg transition-all flex flex-col items-center gap-1"
        >
          <span className="text-4xl">🔥</span>
          <span>Challenge</span>
          <span className="text-sm font-semibold opacity-80">Mix of all 3 — can you beat it?</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function App() {
  const { phase, mode } = useGameStore()
  const [musicOn, setMusicOn] = useState(true)
  const musicOnRef = useRef(true)

  const toggleMusic = () => {
    if (musicOn) { stopAmbient(); setMusicOn(false); musicOnRef.current = false }
    else         { startAmbient(); setMusicOn(true);  musicOnRef.current = true  }
  }

  useEffect(() => {
    startAmbient()
    const unlock = () => { if (musicOnRef.current) startAmbient() }
    document.addEventListener('pointerdown', unlock)
    return () => document.removeEventListener('pointerdown', unlock)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white flex flex-col items-center px-4 py-8 gap-6">
      {/* Header */}
      <header className="w-full max-w-sm flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-purple-500 tracking-tight">
          🎨 Colour & Shape Sparks
        </h1>
        <div className="flex items-center gap-2">
          {phase !== 'idle' && (
            <span className="text-xs text-gray-400 capitalize">{mode} mode</span>
          )}
          <button onClick={toggleMusic} className="text-lg leading-none text-gray-400 hover:text-purple-400 transition-colors"
            title={musicOn ? 'Mute music' : 'Play music'}>
            {musicOn ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      <div className="w-full flex-1 flex flex-col items-center justify-start">
        <AnimatePresence mode="wait">
          {phase === 'idle'    && <ModeSelect key="idle" />}
          {phase === 'quiz'    && mode === 'shapes'    && <ShapeQuiz     key={`sq-${useGameStore.getState().currentIndex}`} />}
          {phase === 'quiz'    && mode === 'colours'   && <ColourQuiz    key={`cq-${useGameStore.getState().currentIndex}`} />}
          {phase === 'quiz'    && mode === 'challenge' && <ChallengeQuiz key={`ch-${useGameStore.getState().currentIndex}`} />}
          {phase === 'trace'   && <ShapeTrace key={`trace-${useGameStore.getState().currentIndex}`} />}
          {phase === 'summary' && <Summary key="summary" />}
        </AnimatePresence>
      </div>
    </div>
  )
}
