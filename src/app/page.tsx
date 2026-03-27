'use client'

import { useSyncExternalStore } from 'react'
import type React from 'react'
import GrindLogo from '@/components/GrindLogo'
import { useRouter } from 'next/navigation'
import PresetCard from '@/components/PresetCard'
import { PRESETS } from '@/lib/presets'
import { getWorkoutsSnapshot, getWorkoutsServerSnapshot, subscribeWorkouts } from '@/lib/storage'
import { encodeWorkout } from '@/lib/utils'
import { C } from '@/lib/colors'
import type { Workout } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const userWorkouts = useSyncExternalStore(subscribeWorkouts, getWorkoutsSnapshot, getWorkoutsServerSnapshot)

  function goToConfig(workout?: Workout, editIndex?: number) {
    if (workout) {
      let url = `/config?w=${encodeWorkout(workout)}`
      if (editIndex !== undefined) url += `&editIndex=${editIndex}`
      router.push(url)
    } else {
      router.push('/config')
    }
  }

  return (
    <div className="full-screen safe-bottom" style={{ background: C.bg, padding: '0 16px 48px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', paddingTop: 64 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <GrindLogo />
          <button
            onClick={() => goToConfig()}
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
        <p style={{ fontSize: 14, color: C.textMuted, margin: '0 0 32px' }}>
          Choose a workout or create your own
        </p>

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
                  onPress={() => goToConfig(w, i)}
                />
              ))}
            </WorkoutGrid>
          </section>
        )}

        {/* Presets */}
        <section>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, letterSpacing: 0.5, marginBottom: 12 }}>
            PRESETS
          </div>
          <WorkoutGrid>
            {PRESETS.map((w, i) => (
              <PresetCard
                key={i}
                workout={w}
                accentColor={C.orange}
                onPress={() => goToConfig(w)}
              />
            ))}
          </WorkoutGrid>
        </section>
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
