'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GrindLogo from '@/components/GrindLogo'
import ConfirmDialog from '@/components/ConfirmDialog'
import { C } from '@/lib/colors'
import S from '@/lib/strings'

export default function LegalPage() {
  const router = useRouter()
  const [showPurge, setShowPurge] = useState(false)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    setHasData(localStorage.length > 0)
  }, [])

  const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: C.text, margin: '32px 0 12px' }
  const p: React.CSSProperties = { fontSize: 14, color: C.textMuted, lineHeight: 1.6, margin: '0 0 12px' }

  return (
    <div className="full-screen safe-bottom" style={{ background: C.bg, padding: '0 16px 48px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 64 }}>
        <div style={{ marginBottom: 32 }}>
          <GrindLogo onClick={() => router.push('/')} />
        </div>

        <h2 style={h2}>{S.impressum}</h2>
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
        <p style={p}>{S.personalProject}</p>
        <p style={p}>{S.feedbackWelcome}</p>

        <h2 style={h2}>{S.privacyPolicy}</h2>
        <p style={p}>{S.privacyIntro}</p>
        <p style={p}>
          <strong style={{ color: C.text }}>Anonymous analytics.</strong> {S.privacyAnalytics}
        </p>
        <p style={p}>
          <strong style={{ color: C.text }}>Local storage only.</strong> {S.privacyStorage}
        </p>
        <p style={p}>
          <strong style={{ color: C.text }}>No accounts.</strong> {S.privacyNoAccounts}
        </p>
        <p style={p}>
          <strong style={{ color: C.text }}>Sharing.</strong> {S.privacySharing}
        </p>
        <p style={p}>
          <strong style={{ color: C.text }}>Your rights.</strong> {S.privacyRights}
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
          {!hasData ? S.noDataStored : S.deleteAllMyData}
        </button>

        <p style={{ ...p, marginTop: 24, color: `${C.textMuted}88` }}>
          {S.lastUpdated}
        </p>
      </div>

      {showPurge && (
        <ConfirmDialog
          title={S.deleteAllDataTitle}
          message={S.deleteAllDataMessage}
          confirmLabel={S.deleteEverything}
          confirmColor={C.red}
          cancelLabel={S.cancel}
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
