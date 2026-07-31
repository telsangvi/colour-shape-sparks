let audio: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio('/music.m4a')
    audio.loop   = true
    audio.volume = 0.12
  }
  return audio
}

export function startAmbient() {
  try { getAudio().play() } catch {}
}

export function stopAmbient() {
  try { getAudio().pause() } catch {}
}
