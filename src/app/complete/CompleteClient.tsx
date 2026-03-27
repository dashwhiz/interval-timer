'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { formatTime } from '@/lib/utils'
import { C } from '@/lib/colors'

export default function CompleteClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const name = searchParams.get('name') ?? ''
  const elapsed = parseInt(searchParams.get('elapsed') ?? '0')

  return (
    <div className="full-screen safe-top safe-bottom" style={{
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 20,
    }}>
      {/* Checkmark */}
      <div style={{
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: `${C.green}26`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill={C.green}>
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 32,
        fontWeight: 800,
        color: C.text,
        lineHeight: 1.2,
        letterSpacing: -0.5,
        textAlign: 'center',
        margin: 0,
        whiteSpace: 'pre-line',
      }}>
        {'WORKOUT\nCOMPLETE'}
      </h1>

      {/* Workout name */}
      {name && (
        <p style={{ fontSize: 16, color: C.textMuted, fontWeight: 500, margin: 0, textAlign: 'center' }}>
          {name}
        </p>
      )}

      {/* Total time */}
      <div style={{
        fontFamily: 'var(--font-roboto-mono)',
        fontSize: 48,
        fontWeight: 700,
        color: C.orange,
      }}>
        {formatTime(elapsed)}
      </div>

      {/* Done button */}
      <button
        onClick={() => router.push('/')}
        style={{
          width: 200,
          height: 56,
          background: C.green,
          border: 'none',
          borderRadius: 16,
          color: '#fff',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2,
          cursor: 'pointer',
          marginTop: 8,
        }}
      >
        DONE
      </button>
    </div>
  )
}
