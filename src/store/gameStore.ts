import { create } from 'zustand'
import { SHAPES } from '../data/shapes'
import { COLOURS } from '../data/colours'

export type Mode  = 'shapes' | 'colours' | 'challenge' | 'pattern' | 'spotter'
export type Phase = 'idle' | 'quiz' | 'trace' | 'summary'

const SESSION_SIZE = 10

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export interface QuizItem {
  shapeId:  string
  colourId: string
}

function buildSession(): QuizItem[] {
  const items: QuizItem[] = []
  for (let i = 0; i < SESSION_SIZE; i++) {
    const shape  = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    const colour = COLOURS[Math.floor(Math.random() * COLOURS.length)]
    items.push({ shapeId: shape.id, colourId: colour.id })
  }
  return items
}

interface GameStore {
  mode:         Mode | null
  phase:        Phase
  session:      QuizItem[]
  currentIndex: number
  score:        number
  streak:       number
  maxStreak:    number

  startSession:  (mode: Mode) => void
  nextQuestion:  () => void
  recordCorrect: () => void
  resetStreak:   () => void
  setPhase:      (phase: Phase) => void
  goIdle:        () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode:         null,
  phase:        'idle',
  session:      [],
  currentIndex: 0,
  score:        0,
  streak:       0,
  maxStreak:    0,

  startSession: (mode) => {
    if (mode === 'pattern' || mode === 'spotter') {
      set({ mode, phase: 'quiz', session: [], currentIndex: 0, score: 0, streak: 0, maxStreak: 0 })
    } else {
      set({ mode, phase: 'quiz', session: shuffle(buildSession()), currentIndex: 0, score: 0, streak: 0, maxStreak: 0 })
    }
  },

  recordCorrect: () => set(s => {
    const newStreak = s.streak + 1
    return { score: s.score + 1, streak: newStreak, maxStreak: Math.max(s.maxStreak, newStreak) }
  }),

  resetStreak: () => set({ streak: 0 }),

  setPhase: (phase) => set({ phase }),

  nextQuestion: () => {
    const { currentIndex, session } = get()
    if (currentIndex + 1 >= session.length) {
      set({ phase: 'summary' })
    } else {
      set({ currentIndex: currentIndex + 1, phase: 'quiz' })
    }
  },

  goIdle: () => set({ phase: 'idle', mode: null, session: [], currentIndex: 0, score: 0, streak: 0, maxStreak: 0 }),
}))
