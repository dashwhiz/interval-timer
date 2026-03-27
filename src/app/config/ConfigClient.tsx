'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DurationPicker from '@/components/DurationPicker'
import RoundsPicker from '@/components/RoundsPicker'
import ConfirmDialog from '@/components/ConfirmDialog'
import { decodeWorkout, encodeWorkout, totalSeconds, formatDuration } from '@/lib/utils'
import { addWorkout, updateWorkout, deleteWorkout } from '@/lib/storage'
import { initAudio } from '@/lib/audio'
import { C } from '@/lib/colors'
import type { Workout } from '@/lib/types'

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

function deriveSimpleParams(workout: Workout) {
  const workSeg = workout.segments.find(s => s.type === 'work')
  const restSeg = workout.segments.find(s => s.type === 'rest')
  return {
    workSeconds: workSeg?.durationSeconds ?? 30,
    restSeconds: restSeg?.durationSeconds ?? 0,
  }
}

function buildWorkout(name: string, type: Workout['type'], workSeconds: number, restSeconds: number, rounds: number, prepareSeconds: number): Workout {
  const segments: Workout['segments'] = [{ type: 'work', durationSeconds: workSeconds }]
  if (restSeconds > 0) segments.push({ type: 'rest', durationSeconds: restSeconds })
  return { name, type, segments, rounds, prepareSeconds }
}

export default function ConfigClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const wParam = searchParams.get('w')
  const editIndexParam = searchParams.get('editIndex')

  const passedWorkout = wParam ? decodeWorkout(wParam) : null
  const editIndex = editIndexParam !== null ? parseInt(editIndexParam) : null

  const mode: 'new' | 'edit' | 'preset' = !passedWorkout ? 'new' : editIndex !== null ? 'edit' : 'preset'

  const derived = passedWorkout ? deriveSimpleParams(passedWorkout) : { workSeconds: 30, restSeconds: 15 }

  const [name, setName] = useState(passedWorkout?.name ?? 'My Workout')
  const [workSeconds, setWorkSeconds] = useState(derived.workSeconds)
  const [restSeconds, setRestSeconds] = useState(derived.restSeconds)
  const [rounds, setRounds] = useState(passedWorkout?.rounds ?? 3)
  const [prepareSeconds, setPrepareSeconds] = useState(passedWorkout?.prepareSeconds ?? 10)
  const [saveChecked, setSaveChecked] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const origName = passedWorkout?.name ?? ''
  const origWork = derived.workSeconds
  const origRest = derived.restSeconds
  const origRounds = passedWorkout?.rounds ?? 3
  const origPrepare = passedWorkout?.prepareSeconds ?? 10

  const hasChanges =
    name !== origName ||
    workSeconds !== origWork ||
    restSeconds !== origRest ||
    rounds !== origRounds ||
    prepareSeconds !== origPrepare

  const workoutType = passedWorkout?.type ?? 'custom'
  const total = totalSeconds(buildWorkout(name, workoutType, workSeconds, restSeconds, rounds, prepareSeconds))

  function handleStart() {
    initAudio()
    const workout = buildWorkout(name, workoutType, workSeconds, restSeconds, rounds, prepareSeconds)
    if (mode === 'new' && saveChecked) addWorkout(workout)
    router.push(`/timer?w=${encodeWorkout(workout)}`)
  }

  function handleSaveOnly() {
    const workout = buildWorkout(name, workoutType, workSeconds, restSeconds, rounds, prepareSeconds)
    addWorkout(workout)
    router.push('/')
  }

  function handleUpdate() {
    if (editIndex === null) return
    const workout = buildWorkout(name, workoutType, workSeconds, restSeconds, rounds, prepareSeconds)
    updateWorkout(editIndex, workout)
    router.back()
  }

  function handleDeleteConfirm() {
    if (editIndex === null) return
    deleteWorkout(editIndex)
    router.push('/')
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

  const iconBtnStyle: React.CSSProperties = {
    width: 56,
    height: 56,
    background: `${C.red}1F`,
    border: 'none',
    borderRadius: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  return (
    <div className="full-screen safe-bottom" style={{ background: C.bg, padding: '0 16px 48px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 64 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Workout name */}
          {mode !== 'preset' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, letterSpacing: 0.5, marginBottom: 8 }}>
                WORKOUT NAME
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
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 16px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}

          {mode === 'preset' && (
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
              {name}
            </div>
          )}

          <DurationPicker
            label="WORK INTERVAL"
            value={workSeconds}
            step={5}
            min={5}
            max={600}
            onChange={setWorkSeconds}
          />

          <DurationPicker
            label="REST INTERVAL"
            value={restSeconds}
            step={5}
            min={0}
            max={300}
            onChange={setRestSeconds}
          />

          <RoundsPicker value={rounds} onChange={setRounds} />

          <DurationPicker
            label="PREPARE TIME"
            value={prepareSeconds}
            step={5}
            min={0}
            max={30}
            onChange={setPrepareSeconds}
          />

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
                <button style={iconBtnStyle} onClick={() => setShowDeleteConfirm(true)} aria-label="Delete workout">
                  <TrashIcon />
                </button>
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
    </div>
  )
}
