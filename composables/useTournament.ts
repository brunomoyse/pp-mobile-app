import { computed, toRef, unref, type MaybeRef } from 'vue'

export function useTournament(tournamentId: MaybeRef<string>) {
  const id = toRef(tournamentId)

  const { data, status, error, refresh } = useLazyAsyncData(
    `tournament-${unref(id)}`,
    () => GqlGetTournament({ id: unref(id) }),
    {
      watch: [id],
      immediate: true,
    }
  )

  const tournament = computed(() => data.value?.tournament || null)

  // Computed helpers for missing properties
  const registered = computed(() => {
    return tournament.value?.registrations?.filter(
      r => r.status !== 'CANCELLED' && r.status !== 'NO_SHOW'
    ).length || 0
  })

  const spotsLeft = computed(() => {
    const total = tournament.value?.seatCap || 0
    return Math.max(0, total - registered.value)
  })

  const buyIn = computed(() => {
    return tournament.value?.buyInCents
      ? `€${(tournament.value.buyInCents / 100).toFixed(2)}`
      : '€0.00'
  })

  const totalPlayers = computed(() => {
    return tournament.value?.registrations?.length || 0
  })

  const duration = computed(() => {
    if (!tournament.value?.endTime || !tournament.value?.startTime) return 0
    const start = new Date(tournament.value.startTime).getTime()
    const end = new Date(tournament.value.endTime).getTime()
    return Math.floor((end - start) / 60000) // minutes
  })

  return {
    tournament,
    loading: computed(() => status.value === 'pending'),
    error,
    refresh,
    // Computed helpers
    registered,
    spotsLeft,
    buyIn,
    totalPlayers,
    duration,
  }
}
