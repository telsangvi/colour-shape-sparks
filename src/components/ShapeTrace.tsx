import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { SHAPES } from '../data/shapes'
import { COLOURS } from '../data/colours'
import { speak } from '../utils/speech'
import ShapeDisplay from './ShapeDisplay'

export default function ShapeTrace() {
  const { session, currentIndex, nextQuestion } = useGameStore()
  const item   = session[currentIndex]
  const shape  = SHAPES.find(s => s.id === item.shapeId)!
  const colour = COLOURS.find(c => c.id === item.colourId)!

  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const drawing    = useRef(false)

  useEffect(() => {
    speak(`Trace the ${shape.name}!`)
  }, [])

  const getPos = (e: React.Touch | React.MouseEvent) => {
    const canvas = canvasRef.current!
    const rect   = canvas.getBoundingClientRect()
    const clientX = 'clientX' in e ? e.clientX : (e as React.Touch).clientX
    const clientY = 'clientY' in e ? e.clientY : (e as React.Touch).clientY
    return { x: (clientX - rect.left) * (canvas.width / rect.width),
             y: (clientY - rect.top)  * (canvas.height / rect.height) }
  }

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    drawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const pos = getPos('touches' in e ? e.touches[0] : e as React.MouseEvent)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current!.getContext('2d')!
    const pos = getPos('touches' in e ? e.touches[0] : e as React.MouseEvent)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = colour.hex
    ctx.lineWidth   = 12
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
  }

  const stopDraw = () => { drawing.current = false }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto"
    >
      <p className="text-xl font-extrabold text-purple-600 text-center">
        Trace the {shape.name}! ✏️
      </p>

      {/* Canvas with shape guide underneath */}
      <div className="relative bg-white rounded-3xl shadow-lg p-4">
        {/* Dashed shape guide */}
        <div className="absolute inset-4 flex items-center justify-center pointer-events-none">
          <ShapeDisplay id={shape.id} color={colour.hex} size={200} dashed />
        </div>
        <canvas
          ref={canvasRef}
          width={240}
          height={240}
          className="touch-none rounded-2xl"
          style={{ background: 'transparent' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={nextQuestion}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-extrabold py-4 rounded-2xl text-lg shadow-lg transition-colors"
      >
        Done ✓
      </motion.button>
    </motion.div>
  )
}
