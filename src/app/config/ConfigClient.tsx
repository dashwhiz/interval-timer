'use client'

import { useState, useMemo, useRef, useCallback, useEffect, useSyncExternalStore } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import RoundsPicker from '@/components/RoundsPicker'
import SegmentRow from '@/components/SegmentRow'
import ConfirmDialog from '@/components/ConfirmDialog'
import GrindLogo from '@/components/GrindLogo'
import Tooltip from '@/components/Tooltip'
import type { EditableSegment } from '@/components/SegmentRow'
import { formatDuration, encodeWorkout, decodeWorkout } from '@/lib/utils'
import { addWorkout, updateWorkout, deleteWorkout, getWorkoutsSnapshot, getWorkoutsServerSnapshot, subscribeWorkouts } from '@/lib/storage'
import { PRESETS } from '@/lib/presets'
import { initAudio } from '@/lib/audio'
import { C } from '@/lib/colors'
import { trackEvent } from '@/lib/analytics'
import S from '@/lib/strings'
import type { Workout, IntervalSegment } from '@/lib/types'

function TimerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={C.textMuted}>
      <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
    </svg>
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

function resolveWorkoutSync(searchParams: URLSearchParams, userWorkouts: Workout[]): { workout: Workout | null; editIndex: number | null; needsAsync: boolean } {
  const editParam = searchParams.get('edit')
  const presetParam = searchParams.get('preset')

  if (editParam !== null) {
    const idx = parseInt(editParam)
    return { workout: userWorkouts[idx] ?? null, editIndex: idx, needsAsync: false }
  }

  if (presetParam !== null) {
    const idx = parseInt(presetParam)
    return { workout: PRESETS[idx] ?? null, editIndex: null, needsAsync: false }
  }

  if (searchParams.get('share') !== null) {
    return { workout: null, editIndex: null, needsAsync: true }
  }

  return { workout: null, editIndex: null, needsAsync: false }
}

export default function ConfigClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userWorkouts = useSyncExternalStore(subscribeWorkouts, getWorkoutsSnapshot, getWorkoutsServerSnapshot)

  const { workout: syncWorkout, editIndex, needsAsync } = resolveWorkoutSync(searchParams, userWorkouts)
  const isShare = searchParams.get('share') !== null
  const [sharedWorkout, setSharedWorkout] = useState<Workout | null>(null)
  const [shareLoading, setShareLoading] = useState(needsAsync)

  useEffect(() => {
    const shareParam = searchParams.get('share')
    if (!shareParam) return
    decodeWorkout(shareParam).then(w => {
      setSharedWorkout(w)
      if (w) {
        setName(w.name)
        const segs = normalizeSegments(w.segments)
        setSegments(segs)
        setSegmentIds(segs.map((_, i) => `seg-${i + 1}`))
        setRounds(w.rounds)
      }
      setShareLoading(false)
    })
  }, [searchParams])

  const passedWorkout = isShare ? sharedWorkout : syncWorkout
  const mode: 'new' | 'edit' | 'preset' = !passedWorkout ? 'new' : isShare ? 'new' : editIndex !== null ? 'edit' : 'preset'

  const initialSegments = passedWorkout ? normalizeSegments(passedWorkout.segments) : DEFAULT_SEGMENTS

  const [name, setName] = useState(passedWorkout?.name ?? 'My Workout')
  const [segments, setSegments] = useState<EditableSegment[]>(initialSegments)
  const [rounds, setRounds] = useState(passedWorkout?.rounds ?? 3)
  const [saveChecked, setSaveChecked] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSaveBeforeStart, setShowSaveBeforeStart] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [copied, setCopied] = useState(false)

  // Stable IDs for drag-and-drop
  const nextId = useRef(initialSegments.length + 1)
  const [segmentIds, setSegmentIds] = useState(() => initialSegments.map((_, i) => `seg-${i + 1}`))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = segmentIds.indexOf(String(active.id))
    const newIndex = segmentIds.indexOf(String(over.id))
    setSegments(prev => arrayMove(prev, oldIndex, newIndex))
    setSegmentIds(prev => arrayMove(prev, oldIndex, newIndex))
  }, [segmentIds])

  const description = passedWorkout?.description ?? null

  const [savedName, setSavedName] = useState(passedWorkout?.name ?? '')
  const [savedSegJson, setSavedSegJson] = useState(() => JSON.stringify(initialSegments))
  const [savedRounds, setSavedRounds] = useState(passedWorkout?.rounds ?? 3)

  const hasChanges =
    name !== savedName ||
    JSON.stringify(segments) !== savedSegJson ||
    rounds !== savedRounds

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
    if (mode === 'edit' && hasChanges) {
      setShowSaveBeforeStart(true)
      return
    }
    startWorkout()
  }

  function startWorkout(saveFirst?: boolean) {
    initAudio()
    const workout = buildWorkoutFromState()
    if (saveFirst && editIndex !== null) updateWorkout(editIndex, workout)
    if (mode === 'new' && saveChecked) addWorkout(workout)
    trackEvent('workout_started', { workout_name: workout.name, mode, rounds: workout.rounds })
    sessionStorage.setItem('grind-workout', JSON.stringify(workout))
    router.push('/timer')
  }

  function handleSaveOnly() {
    const workout = buildWorkoutFromState()
    addWorkout(workout)
    trackEvent('workout_created', { workout_name: workout.name })
    router.replace('/')
  }

  function handleUpdate() {
    if (editIndex === null) return
    updateWorkout(editIndex, buildWorkoutFromState())
    setSavedName(name)
    setSavedSegJson(JSON.stringify(segments))
    setSavedRounds(rounds)
  }

  function handleDeleteConfirm() {
    if (editIndex === null) return
    deleteWorkout(editIndex)
    setShowDeleteConfirm(false)
    router.replace('/')
  }

  function handleDuplicate() {
    const workout = buildWorkoutFromState()
    addWorkout(workout)
    router.replace('/')
  }

  async function handleShare() {
    const workout = buildWorkoutFromState()
    const base = window.location.pathname.replace(/\/config.*$/, '')
    const encoded = await encodeWorkout(workout)
    const url = `${window.location.origin}${base}/config?share=${encoded}`
    trackEvent('workout_shared', { workout_name: workout.name })

    if (navigator.share) {
      try {
        await navigator.share({ title: workout.name, text: `Check out my workout: ${workout.name}`, url })
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch { /* clipboard denied */ }
    }
  }

  function handleSegmentChange(index: number, updated: EditableSegment) {
    setSegments(prev => prev.map((s, i) => i === index ? updated : s))
  }

  function handleSegmentDelete(index: number) {
    if (segments.length <= 1) return
    setSegments(prev => prev.filter((_, i) => i !== index))
    setSegmentIds(prev => prev.filter((_, i) => i !== index))
  }

  function handleAddSegment() {
    const id = `seg-${nextId.current++}`
    setSegments(prev => [...prev, { type: 'work', durationSeconds: 30 }])
    setSegmentIds(prev => [...prev, id])
  }

  if (shareLoading) {
    return <div className="full-screen" style={{ background: C.bg }} />
  }

  const outlinedBtnStyle = (disabled: boolean): React.CSSProperties => ({
    width: '100%',
    height: 56,
    background: 'transparent',
    border: `1.5px solid ${disabled ? C.elevated : C.green}`,
    borderRadius: 16,
    color: disabled ? `${C.textMuted}4D` : C.green,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 1,
    cursor: disabled ? 'default' : 'pointer',
    transition: 'border-color 120ms, color 120ms',
  })

  return (
    <div className="full-screen safe-bottom" style={{ background: C.bg, padding: '0 16px 48px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 64 }}>
        {/* Header: logo + start button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <GrindLogo onClick={() => router.push('/')} />
          <div style={{ display: 'flex', gap: 8 }}>
            {mode === 'edit' && (
              <Tooltip label={S.tipDuplicate}>
                <button
                  onClick={handleDuplicate}
                  style={{
                    width: 40,
                    height: 40,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-label={S.ariaDuplicateWorkout}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={C.textMuted}>
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                </button>
              </Tooltip>
            )}
            {mode === 'edit' && (
              <Tooltip label={S.tipShare}>
                <button
                  onClick={handleShare}
                  style={{
                    width: 40,
                    height: 40,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-label={S.ariaShareWorkout}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={C.textMuted}>
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                  </svg>
                </button>
              </Tooltip>
            )}
            <Tooltip label={S.tipStartWorkout}>
              <button
                className="glow-border"
                onClick={handleStart}
                style={{
                  width: 40,
                  height: 40,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-label={S.ariaStartWorkout}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={C.text}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
        {copied && (
          <div style={{
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: C.green,
            padding: '8px 0',
          }}>
            {S.linkCopied}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Workout name */}
          {mode !== 'preset' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, letterSpacing: 0.5 }}>
                  {S.workoutName}
                </div>
                {description && (
                  <Tooltip label={S.tipInfo}>
                    <button
                      onClick={() => setShowInfo(true)}
                      style={{
                        width: 20, height: 20, border: `1px solid ${C.border}`, borderRadius: '50%',
                        background: 'none', color: C.textMuted, fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                      }}
                      aria-label={S.ariaWorkoutInfo}
                    >
                      i
                    </button>
                  </Tooltip>
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
                <Tooltip label={S.tipInfo}>
                  <button
                    onClick={() => setShowInfo(true)}
                    style={{
                      width: 24, height: 24, border: `1px solid ${C.border}`, borderRadius: '50%',
                      background: 'none', color: C.textMuted, fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    }}
                    aria-label={S.ariaWorkoutInfo}
                  >
                    i
                  </button>
                </Tooltip>
              )}
            </div>
          )}

          <RoundsPicker value={rounds} onChange={setRounds} />

          {/* Intervals */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, letterSpacing: 0.5, marginBottom: 8 }}>
              {S.intervals}
            </div>
            <DndContext id="segments-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={segmentIds} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {segments.map((seg, i) => (
                    <SegmentRow
                      key={segmentIds[i]}
                      id={segmentIds[i]}
                      segment={seg}
                      index={i}
                      canDelete={segments.length > 1}
                      onChange={handleSegmentChange}
                      onDelete={handleSegmentDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <button
              onClick={handleAddSegment}
              style={{
                width: '100%',
                minHeight: 54,
                marginTop: 8,
                background: 'transparent',
                border: `1.5px dashed ${C.border}`,
                borderRadius: 12,
                color: C.textMuted,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {S.addInterval}
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
                {S.total(formatDuration(total))}
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
                <span style={{ fontSize: 14, color: C.text }}>{S.saveToMyWorkouts}</span>
              </label>
            )}

            {/* Action buttons */}
            {mode === 'new' && (
              <button style={outlinedBtnStyle(!saveChecked)} disabled={!saveChecked} onClick={handleSaveOnly}>
                {S.saveOnly}
              </button>
            )}

            {mode === 'edit' && (
              <button style={outlinedBtnStyle(!hasChanges)} disabled={!hasChanges} onClick={handleUpdate}>
                {S.update}
              </button>
            )}

            {/* Delete (edit mode only) */}
            {mode === 'edit' && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 0',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.red,
                  letterSpacing: 0.3,
                }}
              >
                {S.deleteWorkout}
              </button>
            )}
          </div>

        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title={S.deleteWorkoutTitle}
          message={S.deleteWorkoutMessage(name)}
          confirmLabel={S.deleteBtn}
          confirmColor={C.red}
          cancelLabel={S.keepBtn}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showSaveBeforeStart && (
        <div
          onClick={() => setShowSaveBeforeStart(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.54)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth: 320,
            width: '100%',
            padding: '24px 24px 16px',
            background: C.surface,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>
              {S.unsavedChangesTitle}
            </h2>
            <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.5, margin: 0 }}>
              {S.unsavedChangesMessage}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 20 }}>
              <button
                onClick={() => { setShowSaveBeforeStart(false); startWorkout() }}
                style={{
                  background: 'none', border: 'none', padding: '10px 16px', borderRadius: 8,
                  color: C.textMuted, fontSize: 13, fontWeight: 600, letterSpacing: 0.2, cursor: 'pointer',
                }}
              >
                {S.justStart}
              </button>
              <button
                onClick={() => { setShowSaveBeforeStart(false); startWorkout(true) }}
                style={{
                  background: 'none', border: 'none', padding: '10px 16px', borderRadius: 8,
                  color: C.green, fontSize: 13, fontWeight: 600, letterSpacing: 0.2, cursor: 'pointer',
                }}
              >
                {S.saveAndStart}
              </button>
            </div>
          </div>
        </div>
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
              {S.gotIt}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
