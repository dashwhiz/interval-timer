'use client'

import { formatDuration } from '@/lib/utils'
import { C } from '@/lib/colors'

export type EditableSegment = { type: 'work' | 'rest'; durationSeconds: number; label?: string }

const PLACEHOLDERS = [
  'e.g. Rowing',
  'e.g. Squats',
  'e.g. Burpees',
  'e.g. Plank',
  'e.g. Sprints',
  'e.g. Push-ups',
  'e.g. Lunges',
  'e.g. Curls',
  'e.g. Jump rope',
  'e.g. Deadlifts',
]

const STEP = 5
const MIN = 5
const MAX = 3600

const TYPE_COLORS = {
  work: C.orange,
  rest: '#4ECDC4',
} as const

interface Props {
  segment: EditableSegment
  index: number
  canDelete: boolean
  onChange: (index: number, updated: EditableSegment) => void
  onDelete: (index: number) => void
}

export default function SegmentRow({ segment, index, canDelete, onChange, onDelete }: Props) {
  const color = TYPE_COLORS[segment.type]
  const atMin = segment.durationSeconds <= MIN
  const atMax = segment.durationSeconds >= MAX

  function toggleType() {
    const newType = segment.type === 'work' ? 'rest' : 'work'
    onChange(index, { ...segment, type: newType, label: newType === 'rest' ? undefined : segment.label })
  }

  function changeDuration(delta: number) {
    const next = Math.max(MIN, Math.min(MAX, segment.durationSeconds + delta))
    onChange(index, { ...segment, durationSeconds: next })
  }

  const smallBtn = (disabled: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    border: 'none',
    background: 'none',
    color: disabled ? `${C.textMuted}4D` : C.text,
    fontSize: 20,
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 6,
  })

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        borderLeft: `3px solid ${color}`,
        padding: '8px 10px 8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
      }}
    >
      {/* Left: type toggle + label */}
      <div onClick={toggleType} style={{ flex: 1, minWidth: 0, minHeight: 38, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color, userSelect: 'none' }}>
          {segment.type === 'work' ? 'WORK' : 'REST'}
        </span>
        {segment.type === 'work' ? (
          <input
            value={segment.label ?? ''}
            onChange={e => onChange(index, { ...segment, label: e.target.value || undefined })}
            onClick={e => e.stopPropagation()}
            placeholder={PLACEHOLDERS[index % PLACEHOLDERS.length]}
            style={{
              width: '100%',
              minWidth: 0,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: C.text,
              fontSize: 16,
              fontWeight: 500,
              fontFamily: 'inherit',
              padding: 0,
            }}
          />
        ) : null}
      </div>

      {/* Duration controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <button style={smallBtn(atMin)} disabled={atMin} onClick={() => changeDuration(-STEP)} aria-label="Decrease">
          −
        </button>
        <span style={{
          width: 52,
          textAlign: 'center',
          fontFamily: 'var(--font-roboto-mono)',
          fontSize: 14,
          fontWeight: 600,
          color: C.text,
        }}>
          {formatDuration(segment.durationSeconds)}
        </span>
        <button style={smallBtn(atMax)} disabled={atMax} onClick={() => changeDuration(STEP)} aria-label="Increase">
          +
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }} />

      {/* Delete */}
      <button
        onClick={() => onDelete(index)}
        disabled={!canDelete}
        style={{
          width: 28,
          height: 28,
          border: 'none',
          background: 'none',
          color: canDelete ? C.textMuted : `${C.textMuted}33`,
          fontSize: 15,
          cursor: canDelete ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          padding: 0,
        }}
        aria-label="Remove interval"
      >
        ×
      </button>
    </div>
  )
}
