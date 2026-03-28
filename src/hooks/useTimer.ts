'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { Workout, IntervalSegment } from '@/lib/types'
import { fullSequence } from '@/lib/utils'
import { initAudio, playCountdownTick, playTransition, playCompleteMelody } from '@/lib/audio'
import { SEGMENT_CONFIG } from '@/lib/types'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface TimerState {
  status: TimerStatus
  currentSegmentIndex: number
  secondsLeft: number
  elapsedSeconds: number
}

export interface TimerControls {
  status: TimerStatus
  currentSegment: IntervalSegment | null
  secondsLeft: number
  segmentDuration: number
  round: number
  totalRounds: number
  segmentColor: string
  segmentTextColor: string
  segmentLabel: string
  nextLabel: string | null
  play: () => void
  pause: () => void
  reset: () => void
}

export function useTimer(
  workout: Workout | null,
  onComplete: (elapsed: number) => void
): TimerControls {
  const sequence = useMemo(() => workout ? fullSequence(workout) : [], [workout])
  const totalRounds = workout?.rounds ?? 0
  const hasPrepare = workout ? workout.prepareSeconds > 0 : false
  const segmentsPerRound = workout?.segments.length ?? 1

  const initialSeconds = sequence.length > 0 ? sequence[0].durationSeconds : 0

  const [state, setState] = useState<TimerState>({
    status: 'idle',
    currentSegmentIndex: 0,
    secondsLeft: initialSeconds,
    elapsedSeconds: 0,
  })

  const stateRef = useRef(state)
  stateRef.current = state

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    const prev = stateRef.current
    if (prev.status !== 'running') return

    const newElapsed = prev.elapsedSeconds + 1

    if (prev.secondsLeft <= 1) {
      const nextIndex = prev.currentSegmentIndex + 1
      if (nextIndex >= sequence.length) {
        clearTick()
        playCompleteMelody()
        setState({ status: 'finished', currentSegmentIndex: prev.currentSegmentIndex, secondsLeft: 0, elapsedSeconds: newElapsed })
        setTimeout(() => {
          onCompleteRef.current(newElapsed)
        }, 800)
      } else {
        playTransition()
        navigator.vibrate?.(200)
        setState({
          status: 'running',
          currentSegmentIndex: nextIndex,
          secondsLeft: sequence[nextIndex].durationSeconds,
          elapsedSeconds: newElapsed,
        })
      }
    } else {
      const newSeconds = prev.secondsLeft - 1
      playCountdownTick(newSeconds)
      setState({ ...prev, secondsLeft: newSeconds, elapsedSeconds: newElapsed })
    }
  }, [sequence, clearTick])

  const play = useCallback(() => {
    if (stateRef.current.status === 'finished') return
    initAudio()
    setState(prev => ({ ...prev, status: 'running' }))
  }, [])

  const pause = useCallback(() => {
    clearTick()
    setState(prev => ({ ...prev, status: 'paused' }))
  }, [clearTick])

  const reset = useCallback(() => {
    clearTick()
    setState({
      status: 'idle',
      currentSegmentIndex: 0,
      secondsLeft: sequence.length > 0 ? sequence[0].durationSeconds : 0,
      elapsedSeconds: 0,
    })
  }, [clearTick, sequence])

  useEffect(() => {
    if (state.status === 'running') {
      clearTick()
      intervalRef.current = setInterval(tick, 1000)
    }
    return clearTick
  }, [state.status, tick, clearTick])

  const currentSegment = sequence[state.currentSegmentIndex] ?? null
  const segType = currentSegment?.type ?? 'work'
  const config = SEGMENT_CONFIG[segType]

  let round = 0
  if (workout) {
    const adjustedIndex = hasPrepare
      ? state.currentSegmentIndex - 1
      : state.currentSegmentIndex
    if (adjustedIndex < 0) {
      round = 0
    } else {
      round = Math.floor(adjustedIndex / segmentsPerRound) + 1
    }
  }

  const nextSeg = sequence[state.currentSegmentIndex + 1] ?? null
  const nextConfig = nextSeg ? SEGMENT_CONFIG[nextSeg.type] : null

  return {
    status: state.status,
    currentSegment,
    secondsLeft: state.secondsLeft,
    segmentDuration: currentSegment?.durationSeconds ?? 0,
    round,
    totalRounds,
    segmentColor: config.color,
    segmentTextColor: config.textColor,
    segmentLabel: currentSegment?.label || config.label,
    nextLabel: nextSeg ? (nextSeg.label || nextConfig!.label) : null,
    play,
    pause,
    reset,
  }
}
