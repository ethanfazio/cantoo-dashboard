import { AudioLoadError } from './errors'

export interface AudioSampleResult {
  buffer: AudioBuffer
  source: 'cdn' | 'synthesized'
  error?: AudioLoadError
}

/** Convert a note name (e.g. "A4") to its frequency in Hz. */
export function noteToFrequency(note: string): number {
  const match = note.match(/^([A-Ga-g])(#|b)?(\d+)$/)
  if (!match) return 440 // default to A4

  const [, letter, accidental, octaveStr] = match
  const octave = parseInt(octaveStr, 10)

  const semitones: Record<string, number> = {
    C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2,
  }

  let semitone = semitones[letter.toUpperCase()] ?? 0
  if (accidental === '#') semitone += 1
  if (accidental === 'b') semitone -= 1

  // A4 = 440 Hz, semitone distance from A4
  const distance = semitone + (octave - 4) * 12
  return 440 * Math.pow(2, distance / 12)
}

/** Synthesize a sine wave AudioBuffer with a fade envelope to prevent clicks. */
function synthesizeSineWave(
  ctx: AudioContext,
  frequencyHz: number,
  durationSec: number
): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = Math.ceil(sampleRate * durationSec)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const channel = buffer.getChannelData(0)

  const fadeLength = Math.min(Math.ceil(sampleRate * 0.05), length) // 50ms fade

  for (let i = 0; i < length; i++) {
    let amplitude = Math.sin(2 * Math.PI * frequencyHz * (i / sampleRate))

    // Fade in
    if (i < fadeLength) {
      amplitude *= i / fadeLength
    }
    // Fade out
    if (i > length - fadeLength) {
      amplitude *= (length - i) / fadeLength
    }

    channel[i] = amplitude * 0.5 // keep volume moderate
  }

  return buffer
}

/**
 * Try to load an audio sample from a URL; fall back to a synthesized sine wave.
 * Returns the buffer, its source, and any error that triggered the fallback.
 */
export async function loadAudioSample(
  url: string,
  fallbackFrequencyHz = 440,
  durationSec = 2
): Promise<AudioSampleResult> {
  const ctx = new AudioContext()

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = await ctx.decodeAudioData(arrayBuffer)
    return { buffer, source: 'cdn' }
  } catch (e) {
    const error = new AudioLoadError(url, e instanceof Error ? e.message : 'Failed to load audio sample.')
    const buffer = synthesizeSineWave(ctx, fallbackFrequencyHz, durationSec)
    return { buffer, source: 'synthesized', error }
  }
}

/** Play an AudioBuffer through the default output. */
export function playBuffer(buffer: AudioBuffer): void {
  const ctx = new AudioContext()
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start()
  source.onended = () => ctx.close()
}
