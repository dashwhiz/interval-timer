'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Workout } from '@/lib/types'
import PresetCard from './PresetCard'

interface Props {
  id: string
  workout: Workout
  accentColor: string
  badge?: string
  onPress: () => void
}

export default function SortableWorkoutCard({ id, workout, accentColor, badge, onPress }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
    >
      <PresetCard
        workout={workout}
        accentColor={accentColor}
        badge={badge}
        onPress={onPress}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
