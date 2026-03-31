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
 * Segments: w/r + duration in seconds, optional :Label
 */
export function encodeWorkout(workout: Workout): string {
  const segs = workout.segments
    .filter(s => s.type !== 'prepare')
    .map(s => {
      const prefix = s.type === 'work' ? 'w' : 'r'
      const label = s.label ? `:${s.label}` : ''
      return `${prefix}${s.durationSeconds}${label}`
    })
    .join(',')
  const parts = [workout.name, workout.rounds, workout.prepareSeconds, segs]
  return encodeURIComponent(parts.join('|'))
}

export function decodeWorkout(param: string): Workout | null {
  try {
    const raw = decodeURIComponent(param)
    // Legacy JSON format
    if (raw.startsWith('{')) return JSON.parse(raw) as Workout
    // Compact format
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
  } catch {
    return null
  }
}
