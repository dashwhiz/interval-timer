import { Suspense } from 'react'
import ConfigWrapper from './ConfigWrapper'

export default function ConfigPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0d1117', minHeight: '100vh' }} />}>
      <ConfigWrapper />
    </Suspense>
  )
}
