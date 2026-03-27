'use client'
import { useSearchParams } from 'next/navigation'
import ConfigClient from './ConfigClient'

export default function ConfigWrapper() {
  const searchParams = useSearchParams()
  const preset = searchParams.get('preset')
  const edit = searchParams.get('edit')
  const key = preset !== null ? `preset-${preset}` : edit !== null ? `edit-${edit}` : 'new'
  return <ConfigClient key={key} />
}
