'use client'

import { useRouter } from 'next/navigation'
import GrindLogo from '@/components/GrindLogo'
import { C } from '@/lib/colors'

export default function LegalPage() {
  const router = useRouter()

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
          Email: dashwhiz@gmail.com
        </p>
        <p style={p}>
          This is a personal, non-commercial project built with love and effort
          to make interval training easier — after not finding what I wanted on the market for free.
        </p>

        <h2 style={h2}>Privacy Policy</h2>
        <p style={p}>
          Grind takes your privacy seriously. Here is what you need to know:
        </p>
        <p style={p}>
          <strong style={{ color: C.text }}>No tracking.</strong> This app does not use cookies, analytics,
          or any third-party tracking services. No data is sent to any server.
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
          you have full control. You can clear your data at any time by clearing your browser's site data.
        </p>

        <p style={{ ...p, marginTop: 24, color: `${C.textMuted}88` }}>
          Last updated: March 2026
        </p>
      </div>
    </div>
  )
}
