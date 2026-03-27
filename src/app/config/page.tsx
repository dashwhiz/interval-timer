import { Suspense } from 'react'
import ConfigClient from './ConfigClient'

export default function ConfigPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0d1117', minHeight: '100vh' }} />}>
      <ConfigClient />
    </Suspense>
  )
}
