'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GrindLogo from '@/components/GrindLogo'
import ConfirmDialog from '@/components/ConfirmDialog'
import { C } from '@/lib/colors'

export default function LegalPage() {
  const router = useRouter()
  const [showPurge, setShowPurge] = useState(false)
  const [hasData, setHasData] = useState(() => typeof window !== 'undefined' && localStorage.length > 0)

  const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: C.text, margin: '32px 0 12px' }
  const p: React.CSSProperties = { fontSize: 14, color: C.textMuted, lineHeight: 1.6, margin: '0 0 12px' }

  return (
    <div className="full-screen safe-bottom" style={{ background: C.bg, padding: '0 16px 48px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 64 }}>
        <div style={{ marginBottom: 32 }}>
          <GrindLogo onClick={() => router.push('/')} />
        </div>

        <h2 style={h2}>Impressum</h2>
        <p style={p}>
          Aleksandar Velichkovikj<br />
          Email: <a href="mailto:dashwhiz@gmail.com" style={{ color: C.green, textDecoration: 'none' }}>dashwhiz@gmail.com</a>
        </p>
        <div style={{ marginBottom: 16 }}>
          <a
            href="https://www.linkedin.com/in/aleksandarvelichkovikj"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              color: C.text,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
        </div>
        <p style={p}>
          This is a personal, non-commercial project built with love and effort
          to make interval training easier — after not finding what I wanted on the market for free.
        </p>

        <h2 style={h2}>Privacy Policy</h2>
        <p style={p}>
          Grind takes your privacy seriously. Here is what you need to know:
        </p>
        <p style={p}>
          <strong style={{ color: C.text }}>Anonymous analytics.</strong> This app uses Google Analytics 4 to
          collect anonymous usage data such as page views, country of origin, and general device information.
          IP addresses are anonymized and no personally identifiable information is collected or stored.
          No advertising features are enabled. You can opt out by using a browser extension or
          disabling JavaScript.
        </p>
        <p style={p}>
          <strong style={{ color: C.text }}>Local storage only.</strong> Your workouts and preferences are
          stored exclusively in your browser's local storage on your device. This data never leaves your device.
        </p>
        <p style={p}>
          <strong style={{ color: C.text }}>No accounts.</strong> There is no user registration, login,
          or personal data collection of any kind.
        </p>
        <p style={p}>
          <strong style={{ color: C.text }}>Sharing.</strong> If you choose to share a workout via link,
          the workout data is encoded in the URL itself. No data is stored on any server.
        </p>
        <p style={p}>
          <strong style={{ color: C.text }}>Your rights.</strong> Since all data is stored locally on your device,
          you have full control. You can clear your data at any time using the button below.
        </p>

        <button
          onClick={() => setShowPurge(true)}
          disabled={!hasData}
          style={{
            marginTop: 8,
            padding: '10px 20px',
            background: !hasData ? C.elevated : 'transparent',
            border: `1.5px solid ${!hasData ? C.border : C.red}`,
            borderRadius: 10,
            color: !hasData ? C.textMuted : C.red,
            fontSize: 13,
            fontWeight: 600,
            cursor: !hasData ? 'default' : 'pointer',
          }}
        >
          {!hasData ? 'No data stored' : 'Delete all my data'}
        </button>

        <p style={{ ...p, marginTop: 24, color: `${C.textMuted}88` }}>
          Last updated: March 2026
        </p>
      </div>

      {showPurge && (
        <ConfirmDialog
          title="Delete all data?"
          message="This will remove all your saved workouts, preferences, and session history. This cannot be undone."
          confirmLabel="Delete everything"
          confirmColor={C.red}
          cancelLabel="Cancel"
          onConfirm={() => {
            localStorage.clear()
            sessionStorage.clear()
            setShowPurge(false)
            setHasData(false)
          }}
          onCancel={() => setShowPurge(false)}
        />
      )}
    </div>
  )
}
