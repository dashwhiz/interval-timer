'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'

const DURATION = 10

type Phase = 'idle' | 'playing' | 'done'

function loadBest(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('grind-404-best') ?? '0') || 0
}

function saveBest(score: number) {
  const prev = loadBest()
  if (score > prev) localStorage.setItem('grind-404-best', String(score))
}

export default function NotFound() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [taps, setTaps] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(DURATION)
  const [best, setBest] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)
  const interval = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => { setBest(loadBest()) }, [])

  const start = useCallback(() => {
    setPhase('playing')
    setTaps(0)
    setSecondsLeft(DURATION)
    setIsNewBest(false)

    const startTime = Date.now()
    interval.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = DURATION - elapsed
      if (remaining <= 0) {
        clearInterval(interval.current!)
        setSecondsLeft(0)
        setPhase('done')
      } else {
        setSecondsLeft(remaining)
      }
    }, 100)
  }, [])

  // When phase goes to 'done', check best score
  useEffect(() => {
    if (phase !== 'done') return
    setTaps(current => {
      const prev = loadBest()
      if (current > prev) {
        saveBest(current)
        setBest(current)
        setIsNewBest(true)
      }
      return current
    })
  }, [phase])

  useEffect(() => {
    return () => { if (interval.current) clearInterval(interval.current) }
  }, [])

  const tap = useCallback(() => {
    if (phase === 'playing') setTaps(t => t + 1)
  }, [phase])

  const tps = phase === 'done' ? (taps / DURATION).toFixed(1) : null

  return (
    <div
      className="full-screen safe-bottom"
      style={{
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        padding: '80px 24px 64px',
        userSelect: 'none',
      }}
    >
      {/* 404 Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 'clamp(72px, 20vw, 140px)',
          fontWeight: 900,
          fontFamily: 'var(--font-orbitron)',
          color: C.text,
          lineHeight: 1,
          letterSpacing: -2,
          opacity: 0.15,
        }}>
          404
        </div>
        <div style={{ fontSize: 16, color: C.textMuted, marginTop: -8 }}>
          {phase === 'idle' && "You're lost. Might as well train."}
          {phase === 'playing' && 'GO GO GO!'}
          {phase === 'done' && (isNewBest ? 'NEW PERSONAL BEST!' : 'Not bad!')}
        </div>
      </div>

      {/* Game Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 320 }}>
        {/* Timer / Score Display */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: 0.5, marginBottom: 4 }}>
              TIME
            </div>
            <div style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: 32,
              fontWeight: 700,
              color: secondsLeft <= 3 && phase === 'playing' ? C.red : C.text,
              transition: 'color 200ms',
            }}>
              {secondsLeft}s
            </div>
          </div>
          <div style={{ width: 1, background: C.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: 0.5, marginBottom: 4 }}>
              TAPS
            </div>
            <div style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: 32,
              fontWeight: 700,
              color: C.green,
            }}>
              {taps}
            </div>
          </div>
        </div>

        {/* Tap Button */}
        {phase === 'idle' && (
          <button
            onClick={start}
            style={{
              width: '100%',
              height: 120,
              borderRadius: 20,
              border: `2px solid ${C.green}`,
              background: `${C.green}15`,
              color: C.green,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 1,
              cursor: 'pointer',
              transition: 'transform 80ms',
            }}
          >
            START CHALLENGE
          </button>
        )}

        {phase === 'playing' && (
          <button
            onPointerDown={tap}
            style={{
              width: '100%',
              height: 160,
              borderRadius: 20,
              border: 'none',
              background: C.green,
              color: '#000',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 1,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            TAP!
          </button>
        )}

        {phase === 'done' && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{
              fontSize: 14,
              color: C.textMuted,
              marginBottom: 4,
            }}>
              Your speed
            </div>
            <div style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: 48,
              fontWeight: 700,
              color: isNewBest ? C.orange : C.text,
            }}>
              {tps}
            </div>
            <div style={{ fontSize: 14, color: C.textMuted }}>
              taps/second
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => { setPhase('idle'); setTaps(0); setSecondsLeft(DURATION) }}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: `1.5px solid ${C.border}`,
                  background: 'transparent',
                  color: C.text,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <button
                onClick={() => router.push('/')}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: 'none',
                  background: C.green,
                  color: '#000',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Go home
              </button>
            </div>
          </div>
        )}

        {/* Personal Best */}
        {best > 0 && phase !== 'done' && (
          <div style={{ fontSize: 13, color: C.textMuted }}>
            Personal best: <span style={{ color: C.orange, fontWeight: 600 }}>{best}</span> taps
          </div>
        )}
      </div>
    </div>
  )
}
