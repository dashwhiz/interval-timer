'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatTime } from '@/lib/utils'
import { incrementCompletedSessions } from '@/lib/storage'
import { C } from '@/lib/colors'

export default function CompleteClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => { router.prefetch('/') }, [router])
  useEffect(() => { incrementCompletedSessions() }, [])

  const name = searchParams.get('name') ?? ''
  const elapsed = parseInt(searchParams.get('elapsed') ?? '0') || 0

  return (
    <div className="full-screen safe-top safe-bottom" style={{
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 32px',
      gap: 16,
    }}>
      {/* Check */}
      <svg width="36" height="36" viewBox="0 0 24 24" fill={C.green}>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>

      {/* Workout name */}
      {name && (
        <p style={{ fontSize: 13, color: C.textMuted, fontWeight: 500, margin: 0, textAlign: 'center', letterSpacing: 0.5 }}>
          {name.toUpperCase()}
        </p>
      )}

      {/* Elapsed time — the hero */}
      <div style={{
        fontFamily: 'var(--font-roboto-mono)',
        fontSize: 'clamp(56px, 18vw, 96px)',
        fontWeight: 700,
        color: C.text,
        letterSpacing: '-2px',
        lineHeight: 1,
        marginTop: 8,
        marginBottom: 8,
      }}>
        {formatTime(elapsed)}
      </div>

      {/* Done button */}
      <button
        onClick={() => router.push('/')}
        style={{
          marginTop: 16,
          height: 52,
          paddingLeft: 48,
          paddingRight: 48,
          background: C.elevated,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 2,
          cursor: 'pointer',
        }}
      >
        DONE
      </button>
    </div>
  )
}
