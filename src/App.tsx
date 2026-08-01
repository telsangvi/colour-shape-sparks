import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { useGameStore } from './store/gameStore'
import { startAmbient, stopAmbient } from './utils/ambientMusic'
import ShapeQuiz from './components/ShapeQuiz'
import ColourQuiz from './components/ColourQuiz'
import ChallengeQuiz from './components/ChallengeQuiz'
import PatternQuiz from './components/PatternQuiz'
import ShapeSpotter from './components/ShapeSpotter'
import ShapeTrace from './components/ShapeTrace'
import Summary from './components/Summary'
import './index.css'

function ModeSelect() {
  const { startSession } = useGameStore()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto text-center"
    >
      <div className="text-5xl">🎨</div>
      <div>
        <h1 className="text-3xl font-extrabold text-purple-600 leading-tight">Colour & Shape Sparks</h1>
        <p className="text-gray-400 text-sm mt-1">Pick a mode to start learning!</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {/* Row 1: Shapes + Colours */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => startSession('shapes')}
            className="bg-purple-500 hover:bg-purple-600 text-white font-extrabold py-5 rounded-3xl text-base shadow-lg transition-colors flex flex-col items-center gap-1"
          >
            <span className="text-3xl">🔷</span>
            <span>Shapes</span>
            <span className="text-xs font-semibold opacity-80">circles & more</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => startSession('colours')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-extrabold py-5 rounded-3xl text-base shadow-lg transition-colors flex flex-col items-center gap-1"
          >
            <span className="text-3xl">🌈</span>
            <span>Colours</span>
            <span className="text-xs font-semibold opacity-80">red, blue & more</span>
          </motion.button>
        </div>

        {/* Row 2: Challenge (full width) */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => startSession('challenge')}
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-extrabold py-5 rounded-3xl text-xl shadow-lg transition-all flex flex-col items-center gap-1"
        >
          <span className="text-3xl">🔥</span>
          <span>Challenge</span>
          <span className="text-sm font-semibold opacity-80">Mix of all — can you beat it?</span>
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-purple-100" />
          <span className="text-xs font-bold text-purple-300 whitespace-nowrap">More to explore</span>
          <div className="flex-1 h-px bg-purple-100" />
        </div>

        {/* Row 3: Pattern + Spotter */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => startSession('pattern')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-5 rounded-3xl text-base shadow-lg transition-colors flex flex-col items-center gap-1"
          >
            <span className="text-3xl">🧠</span>
            <span>Pattern</span>
            <span className="text-xs font-semibold opacity-80">what comes next?</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => startSession('spotter')}
            className="bg-teal-500 hover:bg-teal-600 text-white font-extrabold py-5 rounded-3xl text-base shadow-lg transition-colors flex flex-col items-center gap-1"
          >
            <span className="text-3xl">🔍</span>
            <span>Spotter</span>
            <span className="text-xs font-semibold opacity-80">count the shapes!</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onStart}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 cursor-pointer
        bg-gradient-to-b from-purple-100 via-pink-50 to-white select-none"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-8xl"
      >
        🎨
      </motion.div>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-purple-600">Colour & Shape Sparks</h1>
        <p className="text-gray-400 mt-1 text-sm">for curious little minds</p>
      </div>
      <motion.div
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        className="text-purple-400 font-bold text-lg"
      >
        Tap anywhere to start!
      </motion.div>
    </motion.div>
  )
}

export default function App() {
  const { phase, mode } = useGameStore()
  const [started, setStarted] = useState(false)
  const [musicOn, setMusicOn] = useState(true)
  const musicOnRef = useRef(true)

  const handleStart = () => {
    setStarted(true)
    startAmbient()
  }

  const toggleMusic = () => {
    if (musicOn) { stopAmbient(); setMusicOn(false); musicOnRef.current = false }
    else         { startAmbient(); setMusicOn(true);  musicOnRef.current = true  }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white flex flex-col items-center px-4 py-8 gap-6">
      <AnimatePresence>
        {!started && <SplashScreen onStart={handleStart} />}
      </AnimatePresence>

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
          {phase === 'quiz'    && mode === 'pattern'   && <PatternQuiz   key="pattern" />}
          {phase === 'quiz'    && mode === 'spotter'   && <ShapeSpotter  key="spotter" />}
          {phase === 'trace'   && <ShapeTrace key={`trace-${useGameStore.getState().currentIndex}`} />}
          {phase === 'summary' && <Summary key="summary" />}
        </AnimatePresence>
      </div>
    </div>
  )
}
