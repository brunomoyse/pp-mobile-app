import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import type {
  GraphQLResponse,
  GraphQLRequest,
  GraphQLClientOptions,
  UseGraphQLOptions,
  GraphQLQueryResult,
  GraphQLMutationResult,
  GraphQLError
} from '~/types/graphql'

// Default configuration
const DEFAULT_ENDPOINT = process.env.NUXT_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql'
const DEFAULT_OPTIONS: GraphQLClientOptions = {
  endpoint: DEFAULT_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
  cache: true,
  timeout: 10000,
}

// Global cache for request deduplication and caching
const requestCache = new Map<string, Promise<any>>()
const responseCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Generate cache key from query and variables
function getCacheKey(query: string, variables?: Record<string, any>): string {
  return btoa(JSON.stringify({ query: query.trim(), variables }))
}

// Check if cached response is still valid
function isCacheValid(cacheKey: string, ttl: number = 300000): boolean { // 5 minutes default
  const cached = responseCache.get(cacheKey)
  if (!cached) return false
  return Date.now() - cached.timestamp < ttl
}

// Get auth token from storage or composable
function getAuthToken(): string | null {
  if (process.client) {
    return localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
  }
  return null
}

// Core GraphQL client function
async function executeGraphQL<T = any>(
  request: GraphQLRequest,
  options: GraphQLClientOptions = DEFAULT_OPTIONS
): Promise<GraphQLResponse<T>> {
  const { endpoint, headers = {}, timeout = 10000 } = { ...DEFAULT_OPTIONS, ...options }
  
  // Add authorization header if available
  const authToken = getAuthToken()
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result: GraphQLResponse<T> = await response.json()
    
    // Handle GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error('GraphQL Errors:', result.errors)
    }

    return result
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
    throw new Error('Unknown error occurred')
  }
}

// Main GraphQL composable for queries
export function useGraphQLQuery<T = any>(
  query: string,
  variables?: Ref<Record<string, any>> | Record<string, any>,
  options: UseGraphQLOptions = {}
): GraphQLQueryResult<T> {
  const {
    cache = true,
    immediate = true,
    timeout = 10000,
    retry = 1,
    retryDelay = 1000,
  } = options

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<GraphQLError[] | null>(null)

  const variablesRef = isRef(variables) ? variables : ref(variables || {})

  const executeQuery = async (retryCount = 0): Promise<void> => {
    const cacheKey = getCacheKey(query, variablesRef.value)
    
    // Check cache first
    if (cache && isCacheValid(cacheKey)) {
      const cached = responseCache.get(cacheKey)
      if (cached) {
        data.value = cached.data
        return
      }
    }

    // Check if same request is already in flight
    if (cache && requestCache.has(cacheKey)) {
      try {
        const result = await requestCache.get(cacheKey)
        data.value = result
        return
      } catch (err) {
        // Continue to make new request if cached request failed
      }
    }

    loading.value = true
    error.value = null

    const request: GraphQLRequest = {
      query,
      variables: variablesRef.value,
    }

    const requestPromise = executeGraphQL<T>(request, { timeout })
    
    // Store request in cache for deduplication
    if (cache) {
      requestCache.set(cacheKey, requestPromise.then(r => r.data))
    }

    try {
      const response = await requestPromise
      
      if (response.errors) {
        error.value = response.errors
      }
      
      if (response.data) {
        data.value = response.data
        
        // Cache successful response
        if (cache) {
          responseCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
            ttl: 300000, // 5 minutes
          })
        }
      }
    } catch (err) {
      console.error('GraphQL Query Error:', err)
      
      // Retry logic
      if (retryCount < retry) {
        setTimeout(() => {
          executeQuery(retryCount + 1)
        }, retryDelay * (retryCount + 1))
        return
      }
      
      error.value = [{ message: err instanceof Error ? err.message : 'Unknown error' }]
    } finally {
      loading.value = false
      
      // Clean up request cache
      if (cache) {
        requestCache.delete(cacheKey)
      }
    }
  }

  const refetch = () => executeQuery()
  const refresh = async () => {
    // Clear cache and refetch
    const cacheKey = getCacheKey(query, variablesRef.value)
    responseCache.delete(cacheKey)
    requestCache.delete(cacheKey)
    await executeQuery()
  }

  // Watch variables changes
  if (isRef(variables)) {
    watch(variablesRef, () => {
      if (!loading.value) {
        executeQuery()
      }
    }, { deep: true })
  }

  // Execute immediately if requested
  if (immediate) {
    onMounted(() => {
      executeQuery()
    })
  }

  return {
    data: data as Ref<T | null>,
    loading,
    error,
    refetch,
    refresh,
  }
}

// GraphQL composable for mutations
export function useGraphQLMutation<T = any>(
  mutation: string,
  options: UseGraphQLOptions = {}
): GraphQLMutationResult<T> {
  const { timeout = 10000, retry = 0, retryDelay = 1000 } = options

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<GraphQLError[] | null>(null)

  const mutate = async (
    variables?: Record<string, any>,
    retryCount = 0
  ): Promise<T | null> => {
    loading.value = true
    error.value = null

    const request: GraphQLRequest = {
      query: mutation,
      variables,
    }

    try {
      const response = await executeGraphQL<T>(request, { timeout })
      
      if (response.errors) {
        error.value = response.errors
      }
      
      if (response.data) {
        data.value = response.data
        return response.data
      }
      
      return null
    } catch (err) {
      console.error('GraphQL Mutation Error:', err)
      
      // Retry logic
      if (retryCount < retry) {
        setTimeout(() => {
          mutate(variables, retryCount + 1)
        }, retryDelay * (retryCount + 1))
        return null
      }
      
      error.value = [{ message: err instanceof Error ? err.message : 'Unknown error' }]
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    data: data as Ref<T | null>,
    loading,
    error,
    mutate,
  }
}

// GraphQL composable for subscriptions using WebSocket
export function useGraphQLSubscription<T = any>(
  subscription: string,
  variables?: Ref<Record<string, any>> | Record<string, any>,
  options: UseGraphQLOptions = {}
) {
  const { immediate = true } = options
  
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<GraphQLError[] | null>(null)
  const connected = ref(false)
  
  const variablesRef = isRef(variables) ? variables : ref(variables || {})
  let websocket: WebSocket | null = null
  let subscriptionId: string | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  let reconnectTimeout: NodeJS.Timeout | null = null
  
  const connect = () => {
    if (websocket) {
      websocket.close()
    }
    
    loading.value = true
    error.value = null
    connected.value = false
    
    try {
      // Convert HTTP endpoint to WebSocket endpoint
      const wsEndpoint = DEFAULT_ENDPOINT.replace('http://', 'ws://').replace('https://', 'wss://')
      console.log('Connecting to WebSocket endpoint:', wsEndpoint)
      
      websocket = new WebSocket(wsEndpoint, 'graphql-ws')
      console.log('WebSocket created with protocol:', websocket.protocol)
      
      websocket.onopen = () => {
        console.log('✅ WebSocket opened')
        console.log('WebSocket readyState:', websocket?.readyState)
        console.log('WebSocket protocol:', websocket?.protocol)
        
        // Send connection_init immediately (like working example)
        const initMessage = {
          type: 'connection_init'
          // No payload needed - working example sends empty
        }
        
        console.log('📤 Sending connection_init:', JSON.stringify(initMessage))
        
        try {
          websocket.send(JSON.stringify(initMessage))
          console.log('✅ connection_init sent successfully')
        } catch (error) {
          console.error('❌ Failed to send connection_init:', error)
          error.value = [{ message: 'Failed to send connection init' }]
        }
      }
      
      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('📩 Received:', message)
          
          const messageType = message.type
          
          switch (message.type) {
            case 'connection_ack':
              console.log('✅ Connection ACK received')
              // Connection acknowledged, start subscription
              subscriptionId = Math.random().toString(36).substr(2, 9)
              
              const startMessage = {
                id: subscriptionId,
                type: 'start',
                payload: {
                  query: subscription,
                  variables: variablesRef.value
                }
              }
              
              console.log('📤 Starting subscription with ID:', subscriptionId)
              console.log('🔍 Query:', subscription)
              console.log('🔍 Variables:', variablesRef.value)
              
              websocket?.send(JSON.stringify(startMessage))
              
              loading.value = false
              connected.value = true
              error.value = null
              reconnectAttempts = 0 // Reset on successful connection
              break
              
            case 'data':
              console.log('🕐 Clock data:', message.payload)
              // Subscription data received
              if (message.payload?.errors) {
                console.error('❌ Subscription errors:', message.payload.errors)
                // Log each error in detail
                message.payload.errors.forEach((err: any, index: number) => {
                  console.error(`❌ Error ${index + 1}:`, {
                    message: err.message,
                    locations: err.locations,
                    path: err.path,
                    extensions: err.extensions
                  })
                })
                error.value = message.payload.errors
              }
              
              if (message.payload?.data) {
                console.log('✅ Setting subscription data:', message.payload.data)
                data.value = message.payload.data
              }
              break
              
            case 'error':
              console.error('❌ Error:', message.payload)
              error.value = message.payload || [{ message: 'Subscription error' }]
              break
              
            case 'complete':
              console.log('✅ Subscription completed')
              if (message.id === subscriptionId) {
                console.warn('⚠️ Our subscription completed unexpectedly!')
                connected.value = false
                // Don't set error here - complete is normal, but unexpected timing might indicate an issue
              }
              break
              
            case 'connection_error':
              error.value = [{ message: 'WebSocket connection error' }]
              connected.value = false
              loading.value = false
              break
              
            default:
              console.warn('🚨 Unhandled WebSocket message type:', messageType, message)
              break
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
          error.value = [{ message: 'Failed to parse subscription data' }]
        }
      }
      
      websocket.onerror = (error) => {
        console.error('💥 WebSocket error:', error)
        loading.value = false
        connected.value = false
        error.value = [{ message: 'WebSocket connection failed' }]
      }
      
      websocket.onclose = (event) => {
        console.log('WebSocket onclose event:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
        
        loading.value = false
        connected.value = false
        
        if (event.code !== 1000) { // Not normal closure
          console.log('WebSocket closed unexpectedly:', event.code, event.reason)
          
          // Attempt automatic reconnection with exponential backoff
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000) // Max 30 seconds
            reconnectAttempts++
            
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`)
            
            reconnectTimeout = setTimeout(() => {
              connect()
            }, delay)
          } else {
            console.error('Max reconnection attempts reached')
            error.value = [{ message: 'Connection lost and unable to reconnect' }]
          }
        } else {
          // Normal closure, reset reconnect attempts
          reconnectAttempts = 0
        }
      }
      
    } catch (err) {
      loading.value = false
      connected.value = false
      error.value = [{ message: err instanceof Error ? err.message : 'Connection failed' }]
    }
  }
  
  const disconnect = () => {
    console.log('Disconnecting WebSocket subscription')
    
    // Clear any pending reconnection
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    
    if (websocket && subscriptionId) {
      // Send stop message before closing
      const stopMessage = {
        id: subscriptionId,
        type: 'stop'
      }
      
      console.log('Sending stop message:', stopMessage)
      
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(stopMessage))
      }
    }
    
    if (websocket) {
      websocket.close(1000, 'Normal closure')
      websocket = null
    }
    
    subscriptionId = null
    connected.value = false
    loading.value = false
    reconnectAttempts = 0
  }
  
  const reconnect = () => {
    disconnect()
    setTimeout(() => connect(), 1000) // Small delay before reconnect
  }
  
  // Manual method to send connection_init (for debugging)
  const sendConnectionInit = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      console.log('🔧 Manually sending connection_init')
      
      const initMessage = {
        type: 'connection_init'
        // No payload like working example
      }
      
      console.log('📤 Manual connection_init:', JSON.stringify(initMessage))
      
      try {
        websocket.send(JSON.stringify(initMessage))
        console.log('✅ Manual connection_init sent successfully')
      } catch (error) {
        console.error('❌ Failed to manually send connection_init:', error)
      }
    } else {
      console.error('❌ Cannot send connection_init - WebSocket not open. State:', websocket?.readyState)
    }
  }
  
  // Watch variables changes
  if (isRef(variables)) {
    watch(variablesRef, () => {
      if (connected.value) {
        reconnect()
      }
    }, { deep: true })
  }
  
  // Auto-connect if immediate
  if (immediate) {
    onMounted(() => {
      connect()
    })
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    data: data as Ref<T | null>,
    loading,
    error,
    connected,
    connect,
    disconnect,
    reconnect,
    sendConnectionInit, // For debugging
  }
}

// Utility composable for common GraphQL operations
export function useGraphQLClient() {
  const clearCache = () => {
    responseCache.clear()
    requestCache.clear()
  }

  const setAuthToken = (token: string | null) => {
    if (process.client) {
      if (token) {
        localStorage.setItem('auth-token', token)
      } else {
        localStorage.removeItem('auth-token')
        sessionStorage.removeItem('auth-token')
      }
    }
  }

  const getAuthToken = () => {
    if (process.client) {
      return localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    }
    return null
  }

  return {
    clearCache,
    setAuthToken,
    getAuthToken,
    executeGraphQL,
  }
}