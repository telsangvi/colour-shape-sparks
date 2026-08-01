export interface ColourEntry {
  id: string
  name: string
  hex: string
  realWorld: string[]
}

export const COLOURS: ColourEntry[] = [
  { id: 'red',    name: 'Red',    hex: '#EF4444', realWorld: ['an apple', 'a fire truck', 'a strawberry'] },
  { id: 'blue',   name: 'Blue',   hex: '#3B82F6', realWorld: ['the sky', 'the ocean', 'a blueberry'] },
  { id: 'green',  name: 'Green',  hex: '#22C55E', realWorld: ['grass', 'a frog', 'broccoli'] },
  { id: 'yellow', name: 'Yellow', hex: '#EAB308', realWorld: ['the sun', 'a banana', 'a sunflower'] },
  { id: 'orange', name: 'Orange', hex: '#F97316', realWorld: ['an orange', 'a carrot', 'a pumpkin'] },
  { id: 'purple', name: 'Purple', hex: '#A855F7', realWorld: ['a grape', 'lavender', 'an eggplant'] },
  { id: 'pink',   name: 'Pink',   hex: '#EC4899', realWorld: ['a flamingo', 'bubblegum', 'a piglet'] },
]
