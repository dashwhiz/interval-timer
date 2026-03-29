import type { Workout } from './types'

const KEY = 'user_workouts'
const EVENT = 'workouts-changed'

function notify() {
  window.dispatchEvent(new Event(EVENT))
}

export function loadWorkouts(): Workout[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as Workout[]
  } catch {
    return []
  }
}

function persistWorkouts(workouts: Workout[]): void {
  localStorage.setItem(KEY, JSON.stringify(workouts))
  notify()
}

function uniqueName(name: string, workouts: Workout[], excludeIndex?: number): string {
  const others = workouts.filter((_, i) => i !== excludeIndex).map(w => w.name)
  if (!others.includes(name)) return name
  let n = 2
  while (others.includes(`${name} ${n}`)) n++
  return `${name} ${n}`
}

export function addWorkout(workout: Workout): void {
  const workouts = loadWorkouts()
  const safeName = uniqueName(workout.name, workouts)
  persistWorkouts([...workouts, { ...workout, name: safeName }])
}

export function updateWorkout(index: number, workout: Workout): void {
  const workouts = loadWorkouts()
  const safeName = uniqueName(workout.name, workouts, index)
  workouts[index] = { ...workout, name: safeName }
  persistWorkouts([...workouts])
}

export function deleteWorkout(index: number): void {
  const workouts = loadWorkouts()
  if (index < 0 || index >= workouts.length) return
  workouts.splice(index, 1)
  persistWorkouts([...workouts])
}

// Stable snapshot cache for useSyncExternalStore
const EMPTY: Workout[] = []
let _snapJson = ''
let _snap: Workout[] = EMPTY

export function getWorkoutsSnapshot(): Workout[] {
  const json = localStorage.getItem(KEY) ?? '[]'
  if (json !== _snapJson) {
    _snapJson = json
    try { _snap = JSON.parse(json) } catch { _snap = [] }
  }
  return _snap
}

export function getWorkoutsServerSnapshot(): Workout[] {
  return EMPTY
}

// Completed sessions counter
const SESSIONS_KEY = 'grind-completed-sessions'

export function incrementCompletedSessions(): void {
  const count = parseInt(localStorage.getItem(SESSIONS_KEY) ?? '0') || 0
  localStorage.setItem(SESSIONS_KEY, String(count + 1))
  notify()
}

export function getCompletedSessions(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(SESSIONS_KEY) ?? '0') || 0
}

export function getCompletedSessionsSnapshot(): number {
  return parseInt(localStorage.getItem(SESSIONS_KEY) ?? '0') || 0
}

export function getCompletedSessionsServerSnapshot(): number {
  return 0
}

export function subscribeWorkouts(cb: () => void): () => void {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}
