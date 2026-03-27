'use client'

import { C } from '@/lib/colors'

interface Props {
  value: number
  onChange: (value: number) => void
}

const MIN = 1
const MAX = 100

export default function RoundsPicker({ value, onChange }: Props) {
  const atMin = value <= MIN
  const atMax = value >= MAX

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
        ROUNDS
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
          onClick={() => onChange(Math.max(MIN, value - 1))}
          aria-label="Decrease rounds"
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
          {value}
        </span>
        <button
          style={btnStyle(atMax)}
          disabled={atMax}
          onClick={() => onChange(Math.min(MAX, value + 1))}
          aria-label="Increase rounds"
        >
          +
        </button>
      </div>
    </div>
  )
}
