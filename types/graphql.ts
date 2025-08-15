// GraphQL Types and Interfaces

export interface GraphQLResponse<T = any> {
  data?: T
  errors?: GraphQLError[]
}

export interface GraphQLError {
  message: string
  locations?: Array<{
    line: number
    column: number
  }>
  path?: Array<string | number>
  extensions?: Record<string, any>
}

export interface GraphQLRequest {
  query: string
  variables?: Record<string, any>
  operationName?: string
}

export interface GraphQLClientOptions {
  endpoint: string
  headers?: Record<string, string>
  cache?: boolean
  timeout?: number
}

export interface UseGraphQLOptions {
  cache?: boolean
  immediate?: boolean
  timeout?: number
  retry?: number
  retryDelay?: number
}

export interface GraphQLQueryResult<T = any> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<GraphQLError[] | null>
  refetch: () => Promise<void>
  refresh: () => Promise<void>
}

export interface GraphQLMutationResult<T = any> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<GraphQLError[] | null>
  mutate: (variables?: Record<string, any>) => Promise<T | null>
}

// Domain-specific types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  phone: string
  isActive: boolean
  role: string
}

export interface Club {
  id: string
  name: string
  location: string
  members: number
  events: number
  logo?: string
}

export interface Tournament {
  id: string
  name: string
  type: string
  status: 'upcoming' | 'live' | 'completed'
  buyIn: number
  startTime: string
  endTime?: string
  maxPlayers?: number
  registeredPlayers: number
  club: Club
  prizePool?: number
  structure?: string
}

export interface TournamentRegistration {
  id: string
  tournament: Tournament
  user: User
  registeredAt: string
  status: 'confirmed' | 'pending' | 'cancelled'
  seatNumber?: number
  tableNumber?: number
}

export interface LeaderboardEntry {
  id: string
  user: User
  rank: number
  points: number
  totalWins: number
  totalWinnings: number
  tournamentsPlayed: number
  winRate: number
  trend?: 'up' | 'down' | 'stable'
  club: Club
}

export interface TournamentResult {
  id: string
  tournament: Tournament
  user: User
  position: number
  totalPlayers: number
  winnings: number
  roi?: number
  playedAt: string
}