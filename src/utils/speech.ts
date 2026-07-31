function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  const preferred = ['Samantha', 'Google US English', 'Microsoft Zira', 'Karen']
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name))
    if (v) return v
  }
  return voices.find(v => v.lang.startsWith('en')) ?? null
}

export function speak(text: string, onEnd?: () => void) {
  if (!window.speechSynthesis) { onEnd?.(); return }
  try {
    window.speechSynthesis.cancel()
    const utterance  = new SpeechSynthesisUtterance(text)
    utterance.rate   = 0.78
    utterance.pitch  = 1.25
    utterance.volume = 1.0
    utterance.lang   = 'en-US'
    const voice = pickVoice()
    if (voice) utterance.voice = voice
    if (onEnd) utterance.onend = onEnd
    window.speechSynthesis.speak(utterance)
  } catch { onEnd?.() }
}

export function stopSpeech() {
  try { window.speechSynthesis?.cancel() } catch {}
}
