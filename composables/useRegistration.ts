// composables/useRegistration.ts
import { computed, ref, watch, onBeforeUnmount } from 'vue'

interface Registration {
  id: string
  registrationTime: string
  status: string
  notes: string | null
}

interface User {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
}

interface TournamentRegistration {
  tournamentId: string
  player: {
    user: User
    registration: Registration
  }
  eventType: string
}

export function useRegistration(tournamentId: string) {
  // Subscribe to registration changes
  const { data: regSubData, execute, stop } = useGqlSubscription({
    query: `
      subscription TournamentRegistrations($tournamentId: ID!) {
        tournamentRegistrations(tournamentId: $tournamentId) {
          tournamentId
          player {
            user {
              id
              firstName
              lastName
              username
              email
            }
            registration {
              id
              registrationTime
              status
              notes
            }
          }
          eventType
        }
      }
    `,
    variables: { tournamentId },
    immediate: true
  })

  const registrationUpdate = computed<TournamentRegistration | null>(() => {
    return regSubData.value?.tournamentRegistrations || null
  })

  // Track registration count
  const registrationCount = ref(0)

  watch(registrationUpdate, (update) => {
    if (update?.eventType === 'REGISTERED') {
      registrationCount.value++
    } else if (update?.eventType === 'CANCELLED') {
      registrationCount.value--
    }
  })

  // Helper to check registration status
  const isRegistered = (userId: string) => {
    if (!registrationUpdate.value) return false
    return (
      registrationUpdate.value.player.user.id === userId &&
      registrationUpdate.value.player.registration.status === 'REGISTERED'
    )
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    registrationUpdate,
    registrationCount,
    isRegistered,
    start: execute,
    stop
  }
}
