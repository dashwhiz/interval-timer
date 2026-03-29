'use client'

import { useEffect } from 'react'
import { C } from '@/lib/colors'

interface Props {
  title: string
  message: string
  confirmLabel: string
  confirmColor?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmColor = C.red,
  cancelLabel = 'CANCEL',
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      role="dialog"
      aria-modal="true"
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
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 320,
          width: '100%',
          padding: '24px 24px 16px',
          background: C.surface,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>
          {title}
        </h2>
        <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.5, margin: 0 }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 20 }}>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              color: C.textMuted,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.5,
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              color: confirmColor,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.5,
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
