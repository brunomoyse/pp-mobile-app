import { computed, type Ref } from 'vue'
import { useGraphQLQuery, useGraphQLMutation } from './useGraphQL'
import type {
  User,
  Club,
  Tournament,
  TournamentRegistration,
  LeaderboardEntry,
  TournamentResult,
} from '~/types/graphql'

// GraphQL Queries
const TOURNAMENTS_QUERY = `
  query GetTournaments($clubId: ID, $status: String, $limit: Int, $offset: Int) {
    tournaments(clubId: $clubId, status: $status, limit: $limit, offset: $offset) {
      id
      name
      type
      status
      buyIn
      startTime
      endTime
      maxPlayers
      registeredPlayers
      prizePool
      structure
      club {
        id
        name
        location
        logo
      }
    }
  }
`

const TOURNAMENT_QUERY = `
  query GetTournament($id: ID!) {
    tournament(id: $id) {
      id
      name
      type
      status
      buyIn
      startTime
      endTime
      maxPlayers
      registeredPlayers
      prizePool
      structure
      description
      club {
        id
        name
        location
        logo
        members
        events
      }
    }
  }
`

const USER_PROFILE_QUERY = `
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      username
      email
      avatar
      verified
      vipLevel
      memberSince
      club {
        id
        name
        location
      }
    }
  }
`

const USER_REGISTRATIONS_QUERY = `
  query GetUserRegistrations($userId: ID!, $status: String) {
    userRegistrations(userId: $userId, status: $status) {
      id
      registeredAt
      status
      seatNumber
      tableNumber
      tournament {
        id
        name
        type
        status
        buyIn
        startTime
        club {
          id
          name
        }
      }
    }
  }
`

const LEADERBOARD_QUERY = `
  query GetLeaderboard($clubId: ID, $period: String, $limit: Int) {
    leaderboard(clubId: $clubId, period: $period, limit: $limit) {
      id
      rank
      points
      totalWins
      totalWinnings
      tournamentsPlayed
      winRate
      trend
      user {
        id
        username
        avatar
        verified
        vipLevel
      }
      club {
        id
        name
      }
    }
  }
`

const TOURNAMENT_HISTORY_QUERY = `
  query GetTournamentHistory($userId: ID!, $clubId: ID, $limit: Int, $offset: Int) {
    tournamentHistory(userId: $userId, clubId: $clubId, limit: $limit, offset: $offset) {
      id
      position
      totalPlayers
      winnings
      roi
      playedAt
      tournament {
        id
        name
        type
        buyIn
        startTime
        club {
          id
          name
        }
      }
    }
  }
`

const CLUBS_QUERY = `
  query GetClubs {
    clubs {
      id
      name
      city
    }
  }
`

const USERS_SEARCH_QUERY = `
  query SearchUsers($query: String!, $clubId: ID, $limit: Int) {
    searchUsers(query: $query, clubId: $clubId, limit: $limit) {
      id
      username
      avatar
      verified
      vipLevel
      totalWins
      totalWinnings
      club {
        id
        name
      }
    }
  }
`

// GraphQL Mutations
const REGISTER_TOURNAMENT_MUTATION = `
  mutation RegisterTournament($tournamentId: ID!) {
    registerTournament(tournamentId: $tournamentId) {
      id
      status
      registeredAt
      seatNumber
      tableNumber
    }
  }
`

const CANCEL_REGISTRATION_MUTATION = `
  mutation CancelRegistration($registrationId: ID!) {
    cancelRegistration(registrationId: $registrationId) {
      id
      status
    }
  }
`

const FOLLOW_USER_MUTATION = `
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      followedAt
    }
  }
`

const UNFOLLOW_USER_MUTATION = `
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      success
    }
  }
`

const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      username
      email
      avatar
      club {
        id
        name
      }
    }
  }
`

// Composables for specific API operations

export function useTournaments(variables?: Ref<{ clubId?: string; status?: string; limit?: number; offset?: number }>) {
  return useGraphQLQuery<{ tournaments: Tournament[] }>(
    TOURNAMENTS_QUERY,
    variables,
    { cache: true }
  )
}

export function useTournament(tournamentId: Ref<string> | string) {
  const variables = computed(() => ({ 
    id: isRef(tournamentId) ? tournamentId.value : tournamentId 
  }))
  
  return useGraphQLQuery<{ tournament: Tournament }>(
    TOURNAMENT_QUERY,
    variables,
    { cache: true }
  )
}

export function useUserProfile(userId: Ref<string> | string) {
  const variables = computed(() => ({ 
    id: isRef(userId) ? userId.value : userId 
  }))
  
  return useGraphQLQuery<{ user: User }>(
    USER_PROFILE_QUERY,
    variables,
    { cache: true }
  )
}

export function useUserRegistrations(variables?: Ref<{ userId: string; status?: string }>) {
  return useGraphQLQuery<{ userRegistrations: TournamentRegistration[] }>(
    USER_REGISTRATIONS_QUERY,
    variables,
    { cache: true }
  )
}

export function useLeaderboard(variables?: Ref<{ clubId?: string; period?: string; limit?: number }>) {
  return useGraphQLQuery<{ leaderboard: LeaderboardEntry[] }>(
    LEADERBOARD_QUERY,
    variables,
    { cache: true }
  )
}

export function useTournamentHistory(variables?: Ref<{ userId: string; clubId?: string; limit?: number; offset?: number }>) {
  return useGraphQLQuery<{ tournamentHistory: TournamentResult[] }>(
    TOURNAMENT_HISTORY_QUERY,
    variables,
    { cache: true }
  )
}

export function useClubs(variables?: Ref<{ limit?: number }>) {
  const { data, loading, error, refetch, refresh } = useGraphQLQuery<{ clubs: Club[] }>(
    CLUBS_QUERY,
    variables,
    { cache: true, immediate: true }
  )
  
  return {
    clubs: computed(() => data.value?.clubs || []),
    loading,
    error,
    refetch,
    refresh,
  }
}

export function useUsersSearch(variables: Ref<{ query: string; clubId?: string; limit?: number }>) {
  return useGraphQLQuery<{ searchUsers: User[] }>(
    USERS_SEARCH_QUERY,
    variables,
    { 
      cache: false, // Don't cache search results
      immediate: false // Only search when explicitly called
    }
  )
}

// Mutation composables

export function useTournamentRegistration() {
  const registerMutation = useGraphQLMutation<{ registerTournament: TournamentRegistration }>(
    REGISTER_TOURNAMENT_MUTATION
  )
  
  const cancelMutation = useGraphQLMutation<{ cancelRegistration: TournamentRegistration }>(
    CANCEL_REGISTRATION_MUTATION
  )

  const register = (tournamentId: string) => registerMutation.mutate({ tournamentId })
  const cancel = (registrationId: string) => cancelMutation.mutate({ registrationId })

  return {
    register,
    cancel,
    registering: registerMutation.loading,
    cancelling: cancelMutation.loading,
    error: computed(() => registerMutation.error.value || cancelMutation.error.value),
  }
}

export function useUserFollow() {
  const followMutation = useGraphQLMutation(FOLLOW_USER_MUTATION)
  const unfollowMutation = useGraphQLMutation(UNFOLLOW_USER_MUTATION)

  const follow = (userId: string) => followMutation.mutate({ userId })
  const unfollow = (userId: string) => unfollowMutation.mutate({ userId })

  return {
    follow,
    unfollow,
    loading: computed(() => followMutation.loading.value || unfollowMutation.loading.value),
    error: computed(() => followMutation.error.value || unfollowMutation.error.value),
  }
}

export function useProfileUpdate() {
  return useGraphQLMutation<{ updateProfile: User }>(UPDATE_PROFILE_MUTATION)
}

// Utility composables for common patterns

export function useCurrentUser() {
  const { getAuthToken } = useGraphQLClient()
  const token = getAuthToken()
  
  if (!token) {
    return {
      data: ref(null),
      loading: ref(false),
      error: ref(null),
      refetch: () => Promise.resolve(),
      refresh: () => Promise.resolve(),
    }
  }

  // Extract user ID from token (assuming JWT)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return useUserProfile(payload.sub || payload.userId)
  } catch {
    return {
      data: ref(null),
      loading: ref(false),
      error: ref([{ message: 'Invalid token' }]),
      refetch: () => Promise.resolve(),
      refresh: () => Promise.resolve(),
    }
  }
}

export function usePaginatedTournaments(clubId?: Ref<string | undefined>) {
  const page = ref(1)
  const limit = 20
  
  const variables = computed(() => ({
    clubId: clubId?.value,
    offset: (page.value - 1) * limit,
    limit,
  }))
  
  const result = useTournaments(variables)
  
  const nextPage = () => {
    page.value++
  }
  
  const prevPage = () => {
    if (page.value > 1) {
      page.value--
    }
  }
  
  const hasNextPage = computed(() => {
    return result.data.value?.tournaments.length === limit
  })
  
  const hasPrevPage = computed(() => page.value > 1)
  
  return {
    ...result,
    page,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
  }
}