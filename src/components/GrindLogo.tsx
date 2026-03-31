'use client'

import { C } from '@/lib/colors'
import S from '@/lib/strings'

interface Props {
  onClick?: () => void
}

export default function GrindLogo({ onClick }: Props) {
  const inner = (
    <>
      <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>
        <span style={{ color: C.text }}>GR</span>
        <span style={{ color: C.orange }}>·</span>
        <span style={{ color: C.orange }}>IND</span>
      </span>
      <div style={{ width: 36, height: 3, background: C.orange, borderRadius: 2 }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: 1.5, marginTop: 2 }}>
        {S.appTagline}
      </span>
    </>
  )

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
    userSelect: 'none',
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        aria-label={S.ariaGoHome}
        style={{ ...baseStyle, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        {inner}
      </button>
    )
  }

  return <div style={baseStyle}>{inner}</div>
}
