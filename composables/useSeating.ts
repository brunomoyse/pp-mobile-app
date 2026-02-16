// composables/useSeating.ts
import { computed, ref, watch, onBeforeUnmount } from 'vue'

interface SeatAssignment {
  id: string
  tournamentId: string
  clubTableId: string
  userId: string
  seatNumber: number
  stackSize: number | null
  isCurrent: boolean
  assignedAt: string
}

interface Player {
  id: string
  firstName: string
  lastName: string
  username: string
}

interface SeatingChange {
  eventType: string
  tournamentId: string
  clubId: string
  affectedAssignment: SeatAssignment | null
  affectedPlayer: Player | null
  message: string
  timestamp: string
}

export function useSeating(clubId: string, tournamentId?: string) {
  // Subscribe to seating changes
  const { data: seatingSubData, execute, stop } = useGqlSubscription({
    query: `
      subscription SeatingChanges($clubId: ID!) {
        clubSeatingChanges(clubId: $clubId) {
          eventType
          tournamentId
          clubId
          affectedAssignment {
            id
            tournamentId
            clubTableId
            userId
            seatNumber
            stackSize
            isCurrent
            assignedAt
          }
          affectedPlayer {
            id
            firstName
            lastName
            username
          }
          message
          timestamp
        }
      }
    `,
    variables: { clubId },
    immediate: true
  })

  const seatingChanges = computed<SeatingChange | null>(() => {
    return seatingSubData.value?.clubSeatingChanges || null
  })

  // Filter changes by tournament if specified
  const filteredChanges = computed(() => {
    if (!seatingChanges.value) return null
    if (!tournamentId) return seatingChanges.value

    return seatingChanges.value.tournamentId === tournamentId
      ? seatingChanges.value
      : null
  })

  // Track user's current seat assignment
  const currentUserSeat = ref<SeatAssignment | null>(null)

  watch(filteredChanges, (change) => {
    if (change?.affectedAssignment?.isCurrent) {
      currentUserSeat.value = change.affectedAssignment
    }
  })

  onBeforeUnmount(() => {
    stop()
  })

  return {
    seatingChanges: filteredChanges,
    currentUserSeat,
    start: execute,
    stop
  }
}
