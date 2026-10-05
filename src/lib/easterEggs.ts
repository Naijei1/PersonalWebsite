import { useEffect, useState } from 'react'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]
const TYPED: Record<string, Egg> = { 'barrel roll': 'roll', askew: 'askew', groovy: 'drums' }

export type Egg = 'roll' | 'askew' | 'drums'

export const EGG_EVENT = 'naijei:egg'

export function fireEgg(egg: Egg) {
  window.dispatchEvent(new CustomEvent<Egg>(EGG_EVENT, { detail: egg }))
}

let audio: AudioContext | null = null

export type DrumKind = 'kick' | 'snare' | 'hat' | 'tom' | 'floor' | 'crash'

const TONES: Partial<Record<DrumKind, [from: number, to: number, len: number]>> = {
  kick: [150, 40, 0.3],
  tom: [240, 120, 0.28],
  floor: [150, 70, 0.4],
}
const NOISE: Partial<Record<DrumKind, [type: BiquadFilterType, freq: number, len: number, level: number]>> = {
  snare: ['bandpass', 1800, 0.18, 0.5],
  hat: ['highpass', 7000, 0.06, 0.25],
  crash: ['highpass', 5000, 0.9, 0.3],
}

/** Tiny synthesized drum kit, so the easter egg needs no audio files. */
export function playDrum(kind: DrumKind) {
  audio ??= new AudioContext()
  const ctx = audio
  const t = ctx.currentTime
  const gain = ctx.createGain()
  gain.connect(ctx.destination)
  const tone = TONES[kind]
  if (tone) {
    const [from, to, len] = tone
    const osc = ctx.createOscillator()
    osc.frequency.setValueAtTime(from, t)
    osc.frequency.exponentialRampToValueAtTime(to, t + len * 0.8)
    gain.gain.setValueAtTime(0.7, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + len)
    osc.connect(gain)
    osc.start(t)
    osc.stop(t + len)
    return
  }
  const [type, freq, len, level] = NOISE[kind]!
  const buffer = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  gain.gain.setValueAtTime(level, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + len)
  src.connect(filter).connect(gain)
  src.start(t)
}

/** Global listeners for the Konami code and typed phrases; returns the egg currently playing on the page. */
export function useEasterEggs() {
  const [active, setActive] = useState<Egg | null>(null)

  useEffect(() => {
    let keys: string[] = []
    let typed = ''
    let timer: number | undefined

    const play = (egg: Egg) => {
      if (egg === 'drums') return fireEgg(egg)
      setActive(egg)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setActive(null), egg === 'roll' ? 1300 : 4000)
    }

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable]')) return
      keys = [...keys, e.key].slice(-KONAMI.length)
      if (keys.join() === KONAMI.join()) {
        keys = []
        play('roll')
      }
      if (e.key.length === 1) {
        typed = (typed + e.key.toLowerCase()).slice(-20)
        for (const [phrase, egg] of Object.entries(TYPED)) {
          if (typed.endsWith(phrase)) {
            typed = ''
            play(egg)
          }
        }
      }
    }
    const onEgg = (e: Event) => {
      const egg = (e as CustomEvent<Egg>).detail
      if (egg !== 'drums') play(egg)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener(EGG_EVENT, onEgg)
    console.log(
      '%cN%ca%ci%cj%ce%ci',
      'color:#4285F4;font:700 32px sans-serif',
      'color:#EA4335;font:700 32px sans-serif',
      'color:#FBBC04;font:700 32px sans-serif',
      'color:#4285F4;font:700 32px sans-serif',
      'color:#34A853;font:700 32px sans-serif',
      'color:#EA4335;font:700 32px sans-serif',
    )
    console.log('Hi, fellow dev 👋 Try typing "barrel roll", "askew", or "groovy" anywhere on the page.')
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(EGG_EVENT, onEgg)
      window.clearTimeout(timer)
    }
  }, [])

  return active
}
