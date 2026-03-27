'use client'

import { formatDuration } from '@/lib/utils'
import { C } from '@/lib/colors'

interface Props {
  label: string
  value: number
  step: number
  min: number
  max: number
  onChange: (value: number) => void
}

export default function DurationPicker({ label, value, step, min, max, onChange }: Props) {
  const atMin = value <= min
  const atMax = value >= max

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 40,
    height: 40,
    border: 'none',
    background: 'none',
    color: disabled ? `${C.textMuted}4D` : C.text,
    fontSize: 24,
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 8,
    transition: 'color 120ms',
  })

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, letterSpacing: 0.5, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{
        background: C.surface,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          style={btnStyle(atMin)}
          disabled={atMin}
          onClick={() => onChange(Math.max(min, value - step))}
          aria-label="Decrease"
        >
          −
        </button>
        <span style={{
          width: 72,
          textAlign: 'center',
          fontFamily: 'var(--font-roboto-mono)',
          fontSize: 16,
          fontWeight: 600,
          color: C.text,
        }}>
          {formatDuration(value)}
        </span>
        <button
          style={btnStyle(atMax)}
          disabled={atMax}
          onClick={() => onChange(Math.min(max, value + step))}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  )
}
