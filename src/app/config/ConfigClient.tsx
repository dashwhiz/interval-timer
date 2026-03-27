'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RoundsPicker from '@/components/RoundsPicker'
import SegmentRow from '@/components/SegmentRow'
import ConfirmDialog from '@/components/ConfirmDialog'
import GrindLogo from '@/components/GrindLogo'
import type { EditableSegment } from '@/components/SegmentRow'
import { formatDuration } from '@/lib/utils'
import { addWorkout, updateWorkout, deleteWorkout, loadWorkouts } from '@/lib/storage'
import { PRESETS } from '@/lib/presets'
import { initAudio } from '@/lib/audio'
import { C } from '@/lib/colors'
import type { Workout, IntervalSegment } from '@/lib/types'

function TimerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={C.textMuted}>
      <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={C.red}>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  )
}

function DeleteIcon() {
  return (
    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${C.red}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill={C.red}>
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
      </svg>
    </div>
  )
}

const DEFAULT_SEGMENTS: EditableSegment[] = [
  { type: 'work', durationSeconds: 30 },
  { type: 'rest', durationSeconds: 15 },
]

function normalizeSegments(segments: IntervalSegment[]): EditableSegment[] {
  const result = segments
    .filter(s => s.type !== 'prepare')
    .map(s => ({ type: s.type as 'work' | 'rest', durationSeconds: s.durationSeconds, label: s.label }))
  return result.length > 0 ? result : DEFAULT_SEGMENTS
}

function resolveWorkout(searchParams: URLSearchParams): { workout: Workout | null; editIndex: number | null } {
  const editParam = searchParams.get('edit')
  const presetParam = searchParams.get('preset')

  if (editParam !== null) {
    const idx = parseInt(editParam)
    const workouts = loadWorkouts()
    return { workout: workouts[idx] ?? null, editIndex: idx }
  }

  if (presetParam !== null) {
    const idx = parseInt(presetParam)
    return { workout: PRESETS[idx] ?? null, editIndex: null }
  }

  return { workout: null, editIndex: null }
}

export default function ConfigClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { workout: passedWorkout, editIndex } = resolveWorkout(searchParams)
  const mode: 'new' | 'edit' | 'preset' = !passedWorkout ? 'new' : editIndex !== null ? 'edit' : 'preset'

  const initialSegments = passedWorkout ? normalizeSegments(passedWorkout.segments) : DEFAULT_SEGMENTS

  const [name, setName] = useState(passedWorkout?.name ?? 'My Workout')
  const [segments, setSegments] = useState<EditableSegment[]>(initialSegments)
  const [rounds, setRounds] = useState(passedWorkout?.rounds ?? 3)
  const [saveChecked, setSaveChecked] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const description = passedWorkout?.description ?? null

  const origRef = useRef({
    name: passedWorkout?.name ?? '',
    segJson: JSON.stringify(initialSegments),
    rounds: passedWorkout?.rounds ?? 3,
  })

  const hasChanges =
    name !== origRef.current.name ||
    JSON.stringify(segments) !== origRef.current.segJson ||
    rounds !== origRef.current.rounds

  const total = useMemo(
    () => segments.reduce((s, seg) => s + seg.durationSeconds, 0) * rounds,
    [segments, rounds],
  )

  function buildWorkoutFromState(): Workout {
    return {
      name,
      type: 'custom',
      segments: segments.map(s => ({ type: s.type, durationSeconds: s.durationSeconds, ...(s.label ? { label: s.label } : {}) })),
      rounds,
      prepareSeconds: 10,
    }
  }

  function handleStart() {
    initAudio()
    const workout = buildWorkoutFromState()
    if (mode === 'new' && saveChecked) addWorkout(workout)
    sessionStorage.setItem('grind-workout', JSON.stringify(workout))
    router.push('/timer')
  }

  function handleSaveOnly() {
    addWorkout(buildWorkoutFromState())
    router.push('/')
  }

  function handleUpdate() {
    if (editIndex === null) return
    updateWorkout(editIndex, buildWorkoutFromState())
    router.back()
  }

  function handleDeleteConfirm() {
    if (editIndex === null) return
    deleteWorkout(editIndex)
    router.push('/')
  }

  function handleSegmentChange(index: number, updated: EditableSegment) {
    setSegments(prev => prev.map((s, i) => i === index ? updated : s))
  }

  function handleSegmentDelete(index: number) {
    if (segments.length <= 1) return
    setSegments(prev => prev.filter((_, i) => i !== index))
  }

  function handleAddSegment() {
    setSegments(prev => [...prev, { type: 'work', durationSeconds: 30 }])
  }

  const outlinedBtnStyle = (disabled: boolean): React.CSSProperties => ({
    flex: 1,
    height: 56,
    background: 'transparent',
    border: `1.5px solid ${disabled ? C.elevated : C.green}`,
    borderRadius: 16,
    color: disabled ? `${C.textMuted}4D` : C.green,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 1,
    cursor: disabled ? 'default' : 'pointer',
    paddingLeft: 16,
    paddingRight: 16,
    transition: 'border-color 120ms, color 120ms',
  })

  const filledBtnStyle: React.CSSProperties = {
    flex: 1,
    height: 56,
    background: C.green,
    border: 'none',
    borderRadius: 16,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 2,
    cursor: 'pointer',
    paddingLeft: 16,
    paddingRight: 16,
  }

  return (
    <div className="full-screen safe-bottom" style={{ background: C.bg, padding: '0 16px 48px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 64 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <GrindLogo onClick={() => router.push('/')} />
          {mode === 'edit' && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: 40,
                height: 40,
                background: `${C.red}1F`,
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-label="Delete workout"
            >
              <TrashIcon />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Workout name */}
          {mode !== 'preset' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, letterSpacing: 0.5 }}>
                  WORKOUT NAME
                </div>
                {description && (
                  <button
                    onClick={() => setShowInfo(true)}
                    style={{
                      width: 20, height: 20, border: `1px solid ${C.border}`, borderRadius: '50%',
                      background: 'none', color: C.textMuted, fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    }}
                    aria-label="Workout info"
                  >
                    i
                  </button>
                )}
              </div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.text,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}

          {mode === 'preset' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{name}</span>
              {description && (
                <button
                  onClick={() => setShowInfo(true)}
                  style={{
                    width: 24, height: 24, border: `1px solid ${C.border}`, borderRadius: '50%',
                    background: 'none', color: C.textMuted, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  }}
                  aria-label="Workout info"
                >
                  i
                </button>
              )}
            </div>
          )}

          <RoundsPicker value={rounds} onChange={setRounds} />

          {/* Intervals */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, letterSpacing: 0.5, marginBottom: 8 }}>
              INTERVALS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {segments.map((seg, i) => (
                <SegmentRow
                  key={i}
                  segment={seg}
                  index={i}
                  canDelete={segments.length > 1}
                  onChange={handleSegmentChange}
                  onDelete={handleSegmentDelete}
                />
              ))}
            </div>
            <button
              onClick={handleAddSegment}
              style={{
                width: '100%',
                padding: '14px 0',
                marginTop: 8,
                background: 'transparent',
                border: `1.5px dashed ${C.border}`,
                borderRadius: 12,
                color: C.textMuted,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.5,
                cursor: 'pointer',
              }}
            >
              + ADD INTERVAL
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: C.border, margin: '4px 0' }} />

          {/* Total + actions block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Total time */}
            <div style={{
              background: C.surface,
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
              <TimerIcon />
              <span style={{
                fontFamily: 'var(--font-roboto-mono)',
                fontSize: 16,
                fontWeight: 600,
                color: C.text,
              }}>
                Total: {formatDuration(total)}
              </span>
            </div>

            {/* Save checkbox (new mode only) */}
            {mode === 'new' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                <div
                  onClick={() => setSaveChecked(v => !v)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `2px solid ${saveChecked ? C.green : '#444'}`,
                    background: saveChecked ? C.green : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 120ms, border-color 120ms',
                  }}
                >
                  {saveChecked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={C.bg}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 14, color: C.text }}>Save to my workouts</span>
              </label>
            )}

            {/* Buttons */}
            {mode === 'new' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={outlinedBtnStyle(!saveChecked)} disabled={!saveChecked} onClick={handleSaveOnly}>
                  SAVE ONLY
                </button>
                <button style={filledBtnStyle} onClick={handleStart}>
                  START
                </button>
              </div>
            )}

            {mode === 'edit' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={outlinedBtnStyle(!hasChanges)} disabled={!hasChanges} onClick={handleUpdate}>
                  UPDATE
                </button>
                <button style={filledBtnStyle} onClick={handleStart}>
                  START
                </button>
              </div>
            )}

            {mode === 'preset' && (
              <button style={{ ...filledBtnStyle, flex: 'unset', width: '100%' }} onClick={handleStart}>
                START
              </button>
            )}
          </div>

        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Workout?"
          message={`"${name}" will be removed from your saved workouts.`}
          confirmLabel="DELETE"
          confirmColor={C.red}
          cancelLabel="KEEP"
          icon={<DeleteIcon />}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showInfo && description && (
        <div
          onClick={() => setShowInfo(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.54)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 360, width: '100%', padding: 24,
              background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{name}</div>
            <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.5, margin: 0 }}>
              {description}
            </p>
            <button
              onClick={() => setShowInfo(false)}
              style={{
                height: 44, background: C.elevated, border: 'none', borderRadius: 12,
                color: C.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4,
              }}
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
