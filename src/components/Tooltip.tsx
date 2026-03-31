'use client'

import { useState, useRef, useCallback, type ReactNode } from 'react'

interface Props {
  label: string
  children: ReactNode
  position?: 'top' | 'bottom'
}

export default function Tooltip({ label, children, position = 'bottom' }: Props) {
  const [visible, setVisible] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>(null)

  const show = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setVisible(true), 400)
  }, [])

  const hide = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    setVisible(false)
  }, [])

  const isTop = position === 'top'

  return (
    <div
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(isTop
              ? { bottom: 'calc(100% + 8px)' }
              : { top: 'calc(100% + 8px)' }),
            background: '#1c2028',
            color: '#c9d1d9',
            fontSize: 12,
            fontWeight: 500,
            padding: '5px 10px',
            borderRadius: 8,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}
