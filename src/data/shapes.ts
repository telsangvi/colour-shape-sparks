export interface ShapeEntry {
  id: string
  name: string
  realWorld: string[]
}

export const SHAPES: ShapeEntry[] = [
  { id: 'circle',    name: 'Circle',    realWorld: ['the sun', 'a pizza', 'a coin', 'a wheel'] },
  { id: 'square',    name: 'Square',    realWorld: ['a window', 'a tile', 'a cracker'] },
  { id: 'triangle',  name: 'Triangle',  realWorld: ['a slice of pizza', 'a mountain', 'a roof'] },
  { id: 'rectangle', name: 'Rectangle', realWorld: ['a door', 'a book', 'a phone'] },
  { id: 'star',      name: 'Star',      realWorld: ['a starfish', 'a cookie cutter', 'the night sky'] },
  { id: 'heart',     name: 'Heart',     realWorld: ['a Valentine card', 'a hug', 'love'] },
  { id: 'oval',      name: 'Oval',      realWorld: ['an egg', 'a mirror', 'a rugby ball'] },
  { id: 'hexagon',   name: 'Hexagon',   realWorld: ['a honeycomb', 'a stop sign', 'a snowflake'] },
]
