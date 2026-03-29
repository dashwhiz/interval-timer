'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTimer } from '@/hooks/useTimer'
import ConfirmDialog from '@/components/ConfirmDialog'
import { formatTime } from '@/lib/utils'
import { setThemeColor } from '@/lib/theme-color'
import { C } from '@/lib/colors'
import type { Workout } from '@/lib/types'

function PlayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  )
}

function PauseIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  )
}

function ResetIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
    </svg>
  )
}

function StopIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  )
}

function loadWorkoutFromSession(): Workout | null {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(sessionStorage.getItem('grind-workout') ?? 'null')
  } catch {
    return null
  }
}

export default function TimerClient() {
  const router = useRouter()
  const [showQuit, setShowQuit] = useState(false)

  const workout = useMemo(() => loadWorkoutFromSession(), [])

  // Redirect home if no workout in session
  useEffect(() => {
    if (!workout) router.replace('/')
  }, [workout, router])

  const handleComplete = useCallback((elapsed: number) => {
    setThemeColor(C.bg)
    const params = new URLSearchParams({
      name: workout?.name ?? '',
      elapsed: String(elapsed),
    })
    router.push(`/complete?${params.toString()}`)
  }, [router, workout?.name])

  const {
    status,
    secondsLeft,
    round,
    totalRounds,
    segmentColor,
    segmentTextColor,
    segmentLabel,
    nextLabel,
    play,
    pause,
    reset,
  } = useTimer(workout, handleComplete)

  useEffect(() => { router.prefetch('/') }, [router])

  useEffect(() => {
    setThemeColor(segmentColor)
  }, [segmentColor])

  useEffect(() => {
    return () => { setThemeColor(C.bg) }
  }, [])

  // Keep screen awake during workout
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null
    if (status === 'running') {
      navigator.wakeLock?.request('screen').then(wl => { wakeLock = wl }).catch(() => {})
    }
    return () => { wakeLock?.release().catch(() => {}) }
  }, [status])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        if (status === 'running') pause()
        else if (status === 'idle' || status === 'paused') play()
      } else if (e.code === 'KeyR') {
        reset()
      } else if (e.code === 'Escape') {
        if (status === 'running') { pause(); setShowQuit(true) }
        else if (status === 'paused') setShowQuit(true)
        else router.push('/')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [status, play, pause, reset, router])

  function handleStop() {
    if (status === 'running') { pause(); setShowQuit(true) }
    else if (status === 'paused') setShowQuit(true)
    else router.push('/')
  }

  function handleQuitConfirm() {
    setShowQuit(false)
    setThemeColor(C.bg)
    router.replace('/')
  }

  function handleQuitCancel() {
    setShowQuit(false)
    if (status === 'paused') play()
  }

  const isPulsing = secondsLeft <= 3 && secondsLeft > 0 && status === 'running'

  if (!workout) return null

  const textColor = segmentTextColor
  const isLight = textColor === '#000000'
  const btnBg = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'

  const circleBtn = (size: number, disabled?: boolean): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: '50%',
    background: btnBg,
    border: 'none',
    color: disabled ? `${textColor}4D` : textColor,
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  })

  function handleTapToggle() {
    if (status === 'running') pause()
    else if (status === 'idle' || status === 'paused') play()
  }

  return (
    <div
      className="full-screen"
      onClick={handleTapToggle}
      style={{
        background: segmentColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'calc(48px + env(safe-area-inset-top))',
        paddingBottom: 'calc(48px + env(safe-area-inset-bottom))',
        paddingLeft: 24,
        paddingRight: 24,
        transition: 'background 500ms ease-in-out',
        cursor: 'pointer',
        userSelect: 'none',
      }}>
      {/* Top: round + next up */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          color: `${textColor}77`,
          letterSpacing: 1,
          minHeight: 20,
        }}>
          {round > 0 ? `ROUND ${round} / ${totalRounds}` : ''}
        </div>
        {nextLabel && (
          <div style={{ fontSize: 12, fontWeight: 500, color: `${textColor}55`, letterSpacing: 0.5 }}>
            Next: {nextLabel}
          </div>
        )}
      </div>

      {/* Center: label + timer as one block */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontSize: 'clamp(24px, 7vw, 44px)',
          fontWeight: 800,
          letterSpacing: 3,
          color: `${textColor}CC`,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}>
          {segmentLabel}
        </div>
        <div style={{
          fontFamily: 'var(--font-orbitron)',
          fontSize: 'clamp(64px, 22vw, 200px)',
          fontWeight: 700,
          color: textColor,
          textShadow: '0 4px 20px rgba(0,0,0,0.2)',
          letterSpacing: '-2px',
          lineHeight: 1,
          textAlign: 'center',
          transform: isPulsing ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 300ms ease-out',
          willChange: 'transform',
        }}>
          {formatTime(secondsLeft)}
        </div>
      </div>

      {/* Controls + next up */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <button style={circleBtn(56)} onClick={reset} aria-label="Reset">
          <ResetIcon size={28} />
        </button>

        <button
          style={circleBtn(72, status === 'finished')}
          disabled={status === 'finished'}
          onClick={() => status === 'running' ? pause() : play()}
          aria-label={status === 'running' ? 'Pause' : 'Play'}
        >
          {status === 'running'
            ? <PauseIcon size={40} />
            : <PlayIcon size={40} />}
        </button>

        <button style={circleBtn(56)} onClick={handleStop} aria-label="Stop">
          <StopIcon size={28} />
        </button>
      </div>
      </div>

      {showQuit && (
        <ConfirmDialog
          title="Quit Workout?"
          message="Your progress will be lost."
          confirmLabel="QUIT"
          confirmColor={C.red}
          cancelLabel="KEEP GOING"
          onConfirm={handleQuitConfirm}
          onCancel={handleQuitCancel}
        />
      )}
    </div>
  )
}
