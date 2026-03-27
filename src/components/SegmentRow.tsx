'use client'

import { formatDuration } from '@/lib/utils'
import { C } from '@/lib/colors'

export type EditableSegment = { type: 'work' | 'rest'; durationSeconds: number }

const STEP = 5
const MIN = 5
const MAX = 3600

const TYPE_STYLES = {
  work: { bg: `${C.orange}33`, color: C.orange, label: 'WORK' },
  rest: { bg: '#4ECDC433', color: '#4ECDC4', label: 'REST' },
} as const

interface Props {
  segment: EditableSegment
  index: number
  canDelete: boolean
  onChange: (index: number, updated: EditableSegment) => void
  onDelete: (index: number) => void
}

export default function SegmentRow({ segment, index, canDelete, onChange, onDelete }: Props) {
  const ts = TYPE_STYLES[segment.type]
  const atMin = segment.durationSeconds <= MIN
  const atMax = segment.durationSeconds >= MAX

  function toggleType() {
    const newType = segment.type === 'work' ? 'rest' : 'work'
    onChange(index, { ...segment, type: newType })
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
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '6px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      {/* Type badge */}
      <button
        onClick={toggleType}
        style={{
          background: ts.bg,
          color: ts.color,
          border: 'none',
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.5,
          cursor: 'pointer',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {ts.label}
      </button>

      {/* Duration controls */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
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

      {/* Delete */}
      <button
        onClick={() => onDelete(index)}
        disabled={!canDelete}
        style={{
          width: 32,
          height: 32,
          border: 'none',
          background: canDelete ? `${C.red}1F` : 'transparent',
          borderRadius: 8,
          color: C.red,
          fontSize: 16,
          cursor: canDelete ? 'pointer' : 'default',
          opacity: canDelete ? 1 : 0.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label="Remove interval"
      >
        ×
      </button>
    </div>
  )
}
