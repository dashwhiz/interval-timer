'use client'

import { useState } from 'react'
import type { Workout } from '@/lib/types'
import { SEGMENT_CONFIG } from '@/lib/types'
import { totalSeconds as ts, formatDuration as fd } from '@/lib/utils'
import { C } from '@/lib/colors'

function TimerIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={color}>
      <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
    </svg>
  )
}

function RepeatIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={color}>
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
    </svg>
  )
}

interface Props {
  workout: Workout
  accentColor: string
  badge?: string
  onPress: () => void
}

export default function PresetCard({ workout, accentColor, badge, onPress }: Props) {
  const [hovered, setHovered] = useState(false)
  const total = ts(workout)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onPress() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.elevated : C.surface,
        border: `1px solid ${hovered ? `${accentColor}4D` : C.border}`,
        borderRadius: 14,
        padding: 16,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        userSelect: 'none',
        outline: 'none',
        transition: 'background 120ms, border-color 120ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize: 16, fontWeight: 600, color: C.text, flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {workout.name}
        </span>
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            color: accentColor, background: `${accentColor}22`,
            borderRadius: 6, padding: '3px 7px', whiteSpace: 'nowrap',
          }}>
            {badge}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <TimerIcon color={C.textMuted} />
        <span style={{ fontSize: 12, color: C.textMuted }}>{fd(total)}</span>
        <RepeatIcon color={C.textMuted} />
        <span style={{ fontSize: 12, color: C.textMuted }}>{workout.rounds} rounds</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {workout.segments.filter(s => s.type !== 'prepare').slice(0, 6).map((s, i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: SEGMENT_CONFIG[s.type].color,
              }}
            />
          ))}
          {workout.segments.filter(s => s.type !== 'prepare').length > 6 && (
            <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 600 }}>
              +{workout.segments.filter(s => s.type !== 'prepare').length - 6}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
