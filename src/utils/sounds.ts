let ctx: AudioContext | null = null

function audio(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function playTap() {
  try {
    const c = audio()
    const o = c.createOscillator(); const g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(700, c.currentTime)
    o.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.07)
    g.gain.setValueAtTime(0.12, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07)
    o.start(); o.stop(c.currentTime + 0.07)
  } catch {}
}

export function playCorrect() {
  try {
    const c = audio()
    ;[523, 659, 784].forEach((freq, i) => {
      const o = c.createOscillator(); const g = c.createGain()
      o.connect(g); g.connect(c.destination)
      o.type = 'sine'; o.frequency.value = freq
      const t = c.currentTime + i * 0.1
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.05)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      o.start(t); o.stop(t + 0.35)
    })
  } catch {}
}

export function playWrong() {
  try {
    const c = audio()
    const o = c.createOscillator(); const g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = 'square'
    o.frequency.setValueAtTime(280, c.currentTime)
    o.frequency.exponentialRampToValueAtTime(140, c.currentTime + 0.22)
    g.gain.setValueAtTime(0.08, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22)
    o.start(); o.stop(c.currentTime + 0.22)
  } catch {}
}
