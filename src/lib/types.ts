export interface IntervalSegment {
  type: 'work' | 'rest' | 'prepare'
  durationSeconds: number
}

export interface Workout {
  name: string
  type: 'tabata' | 'emom' | 'amrap' | 'forTime' | 'custom'
  segments: IntervalSegment[]
  rounds: number
  prepareSeconds: number
}

export const SEGMENT_CONFIG = {
  work:    { label: 'WORK',      color: '#FF6B35', textColor: '#FFFFFF' },
  rest:    { label: 'REST',      color: '#4ECDC4', textColor: '#FFFFFF' },
  prepare: { label: 'GET READY', color: '#FFE66D', textColor: '#000000' },
} as const

export const TYPE_LABELS: Record<Workout['type'], string> = {
  tabata:  'TABATA',
  emom:    'EMOM',
  amrap:   'AMRAP',
  forTime: 'FOR TIME',
  custom:  'CUSTOM',
}
