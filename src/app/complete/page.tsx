import { Suspense } from 'react'
import CompleteClient from './CompleteClient'

export default function CompletePage() {
  return (
    <Suspense fallback={<div style={{ background: '#0d1117', minHeight: '100vh' }} />}>
      <CompleteClient />
    </Suspense>
  )
}
