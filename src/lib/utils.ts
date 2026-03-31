import type { Workout, IntervalSegment } from './types'

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}m`
  return `${m}m ${s}s`
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function totalSeconds(workout: Workout): number {
  const segmentTotal = workout.segments.reduce((sum, s) => sum + s.durationSeconds, 0)
  return segmentTotal * workout.rounds
}

export function fullSequence(workout: Workout): IntervalSegment[] {
  const seq: IntervalSegment[] = []
  if (workout.prepareSeconds > 0) {
    seq.push({ type: 'prepare', durationSeconds: workout.prepareSeconds })
  }
  for (let r = 0; r < workout.rounds; r++) {
    seq.push(...workout.segments)
  }
  return seq
}

/**
 * Compact share format: name|rounds|prep|w30:Label,r15,w45
 * Then deflate-compressed + base64url-encoded for shorter URLs.
 * Falls back to uncompressed compact format if CompressionStream unavailable.
 */

function toCompact(workout: Workout): string {
  const segs = workout.segments
    .filter(s => s.type !== 'prepare')
    .map(s => {
      const prefix = s.type === 'work' ? 'w' : 'r'
      const label = s.label ? `:${s.label}` : ''
      return `${prefix}${s.durationSeconds}${label}`
    })
    .join(',')
  return [workout.name, workout.rounds, workout.prepareSeconds, segs].join('|')
}

function fromCompact(raw: string): Workout | null {
  const [name, roundsStr, prepStr, segsStr] = raw.split('|')
  if (!name || !roundsStr || !prepStr || !segsStr) return null
  const segments: IntervalSegment[] = segsStr.split(',').map(s => {
    const type = s[0] === 'w' ? 'work' : 'rest'
    const rest = s.slice(1)
    const colonIdx = rest.indexOf(':')
    const durationSeconds = parseInt(colonIdx >= 0 ? rest.slice(0, colonIdx) : rest)
    const label = colonIdx >= 0 ? rest.slice(colonIdx + 1) : undefined
    return { type, durationSeconds, ...(label ? { label } : {}) } as IntervalSegment
  })
  return {
    name,
    type: 'custom',
    segments,
    rounds: parseInt(roundsStr),
    prepareSeconds: parseInt(prepStr),
  }
}

// Base64url helpers (no padding, URL-safe)
function toBase64url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - (str.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function compress(input: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const blob = new Blob([encoder.encode(input)])
  const stream = blob.stream().pipeThrough(new CompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function decompress(bytes: Uint8Array): Promise<string> {
  const blob = new Blob([bytes as BlobPart])
  const stream = blob.stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Response(stream).text()
}

export async function encodeWorkout(workout: Workout): Promise<string> {
  const compact = toCompact(workout)
  try {
    const compressed = await compress(compact)
    return 'z.' + toBase64url(compressed)
  } catch {
    return encodeURIComponent(compact)
  }
}

export async function decodeWorkout(param: string): Promise<Workout | null> {
  try {
    // Compressed format (z. prefix)
    if (param.startsWith('z.')) {
      const bytes = fromBase64url(param.slice(2))
      const compact = await decompress(bytes)
      return fromCompact(compact)
    }
    const raw = decodeURIComponent(param)
    // Legacy JSON format
    if (raw.startsWith('{')) return JSON.parse(raw) as Workout
    // Uncompressed compact format
    return fromCompact(raw)
  } catch {
    return null
  }
}
