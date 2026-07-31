export interface ColourEntry {
  id: string
  name: string
  hex: string
}

export const COLOURS: ColourEntry[] = [
  { id: 'red',    name: 'Red',    hex: '#EF4444' },
  { id: 'blue',   name: 'Blue',   hex: '#3B82F6' },
  { id: 'green',  name: 'Green',  hex: '#22C55E' },
  { id: 'yellow', name: 'Yellow', hex: '#EAB308' },
  { id: 'orange', name: 'Orange', hex: '#F97316' },
  { id: 'purple', name: 'Purple', hex: '#A855F7' },
  { id: 'pink',   name: 'Pink',   hex: '#EC4899' },
]
