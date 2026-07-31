export function speak(text: string, onEnd?: () => void) {
  if (!window.speechSynthesis) { onEnd?.(); return }
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate  = 0.80
    utterance.pitch = 1.1
    utterance.lang  = 'en-US'
    if (onEnd) utterance.onend = onEnd
    window.speechSynthesis.speak(utterance)
  } catch { onEnd?.() }
}

export function stopSpeech() {
  try { window.speechSynthesis?.cancel() } catch {}
}
