// composables/useTournamentClock.ts
import { computed, ref, watch, onBeforeUnmount } from 'vue'

interface ClockStructure {
  id: string
  levelNumber: number
  smallBlind: number
  bigBlind: number
  ante: number | null
  durationMinutes: number
  isBreak: boolean
  breakDurationMinutes: number | null
}

interface TournamentClock {
  id: string
  tournamentId: string
  status: string
  currentLevel: number
  timeRemainingSeconds: number
  levelStartedAt: string
  levelEndTime: string
  totalPauseDurationSeconds: number
  autoAdvance: boolean
  currentStructure: ClockStructure | null
  nextStructure: ClockStructure | null
}

export function useTournamentClock(tournamentId: string) {
  // Subscribe to clock updates via GraphQL subscription
  const { data: clockSubData, execute, stop } = useGqlSubscription({
    query: `
      subscription TournamentClockUpdates($tournamentId: ID!) {
        tournamentClockUpdates(tournamentId: $tournamentId) {
          id
          tournamentId
          status
          currentLevel
          timeRemainingSeconds
          levelStartedAt
          levelEndTime
          totalPauseDurationSeconds
          autoAdvance
          currentStructure {
            id
            tournamentId
            levelNumber
            smallBlind
            bigBlind
            ante
            durationMinutes
            isBreak
            breakDurationMinutes
          }
          nextStructure {
            id
            tournamentId
            levelNumber
            smallBlind
            bigBlind
            ante
            durationMinutes
            isBreak
            breakDurationMinutes
          }
        }
      }
    `,
    variables: { tournamentId },
    immediate: true
  })

  const clockData = computed<TournamentClock | null>(() => {
    return clockSubData.value?.tournamentClockUpdates || null
  })

  const currentLevel = computed(() => {
    if (!clockData.value || !clockData.value.currentStructure) {
      return null
    }

    return {
      level: clockData.value.currentLevel,
      smallBlind: clockData.value.currentStructure.smallBlind,
      bigBlind: clockData.value.currentStructure.bigBlind,
      ante: clockData.value.currentStructure.ante,
      isBreak: clockData.value.currentStructure.isBreak
    }
  })

  const nextLevel = computed(() => {
    if (!clockData.value || !clockData.value.nextStructure) {
      return null
    }

    return {
      level: clockData.value.nextStructure.levelNumber,
      smallBlind: clockData.value.nextStructure.smallBlind,
      bigBlind: clockData.value.nextStructure.bigBlind,
      ante: clockData.value.nextStructure.ante,
      isBreak: clockData.value.nextStructure.isBreak
    }
  })

  const timeRemaining = computed(() => {
    return clockData.value?.timeRemainingSeconds || 0
  })

  const isRunning = computed(() => {
    return clockData.value?.status === 'RUNNING'
  })

  const isPaused = computed(() => {
    return clockData.value?.status === 'PAUSED'
  })

  onBeforeUnmount(() => {
    stop()
  })

  return {
    clockData,
    currentLevel,
    nextLevel,
    timeRemaining,
    isRunning,
    isPaused,
    start: execute,
    stop
  }
}
