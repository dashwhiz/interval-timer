'use client'

import { C } from '@/lib/colors'

interface Props {
  title: string
  message: string
  confirmLabel: string
  confirmColor?: string
  cancelLabel?: string
  icon?: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmColor = C.red,
  cancelLabel = 'CANCEL',
  icon,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
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
          maxWidth: 340,
          width: '100%',
          padding: 28,
          background: C.surface,
          borderRadius: 20,
          border: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {icon && (
          <div style={{ marginBottom: 4 }}>
            {icon}
          </div>
        )}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, textAlign: 'center' }}>
          {title}
        </h2>
        <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.4, margin: 0, textAlign: 'center' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 48,
              background: C.elevated,
              border: 'none',
              borderRadius: 12,
              color: C.text,
              fontSize: 14,
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
              flex: 1,
              height: 48,
              background: confirmColor,
              border: 'none',
              borderRadius: 12,
              color: C.text,
              fontSize: 14,
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
