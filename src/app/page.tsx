'use client'

import { useCallback, useSyncExternalStore } from 'react'

const PRESETS_KEY = 'grind-presets-visibility'
function getPresetsSnapshot() { return localStorage.getItem(PRESETS_KEY) !== 'hide' }
function getPresetsServerSnapshot() { return true }
function subscribePresets(cb: () => void) {
  window.addEventListener('storage', cb)
  return () => window.removeEventListener('storage', cb)
}
import type React from 'react'
import GrindLogo from '@/components/GrindLogo'
import { useRouter } from 'next/navigation'
import PresetCard from '@/components/PresetCard'
import { PRESETS } from '@/lib/presets'
import { getWorkoutsSnapshot, getWorkoutsServerSnapshot, subscribeWorkouts } from '@/lib/storage'
import { C } from '@/lib/colors'

export default function HomePage() {
  const router = useRouter()
  const userWorkouts = useSyncExternalStore(subscribeWorkouts, getWorkoutsSnapshot, getWorkoutsServerSnapshot)
  const presetsOpen = useSyncExternalStore(subscribePresets, getPresetsSnapshot, getPresetsServerSnapshot)

  const togglePresets = useCallback(() => {
    localStorage.setItem(PRESETS_KEY, presetsOpen ? 'hide' : 'show')
    window.dispatchEvent(new Event('storage'))
  }, [presetsOpen])

  function goToEdit(index: number) {
    router.push(`/config?edit=${index}`)
  }

  function goToPreset(index: number) {
    router.push(`/config?preset=${index}`)
  }

  return (
    <div className="full-screen safe-bottom" style={{ background: C.bg, padding: '0 16px 48px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', paddingTop: 64, width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <GrindLogo />
          <button
            onClick={() => router.push('/config')}
            style={{
              width: 40,
              height: 40,
              background: C.green,
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 22,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="New workout"
          >
            +
          </button>
        </div>
        <div style={{ marginBottom: 32 }} />

        {/* User workouts */}
        {userWorkouts.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, letterSpacing: 0.5, marginBottom: 12 }}>
              YOUR WORKOUTS
            </div>
            <WorkoutGrid>
              {userWorkouts.map((w, i) => (
                <PresetCard
                  key={i}
                  workout={w}
                  accentColor={C.green}
                  badge="CUSTOM"
                  onPress={() => goToEdit(i)}
                />
              ))}
            </WorkoutGrid>
          </section>
        )}

        {/* Presets */}
        <section>
          <button
            onClick={togglePresets}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '8px 0',
              marginBottom: 4,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, letterSpacing: 0.5 }}>
              PRESETS
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={C.textMuted}
              style={{
                transition: 'transform 250ms ease',
                transform: presetsOpen ? 'rotate(0deg)' : 'rotate(-180deg)',
              }}
            >
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
            </svg>
          </button>
          {presetsOpen && (
            <WorkoutGrid>
              {PRESETS.map((w, i) => (
                <PresetCard
                  key={i}
                  workout={w}
                  accentColor={C.orange}
                  onPress={() => goToPreset(i)}
                />
              ))}
            </WorkoutGrid>
          )}
        </section>

        {/* Legal */}
        <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 48 }}>
          <div style={{ width: 40, height: 1, background: C.border, margin: '0 auto 12px' }} />
          <div style={{ color: `${C.textMuted}44`, fontSize: 11, marginBottom: 6 }}>
            © 2026 Grind
          </div>
          <button
            onClick={() => router.push('/legal')}
            style={{
              background: 'none',
              border: 'none',
              color: `${C.textMuted}66`,
              fontSize: 11,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Impressum & Privacy
          </button>
        </div>
      </div>
    </div>
  )
}

function WorkoutGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 10,
    }}>
      {children}
    </div>
  )
}
