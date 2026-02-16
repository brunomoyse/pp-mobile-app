import { computed } from 'vue'
import { useAuthStore } from '~/stores/useAuthStore'

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export const useAuth = () => {
  const authStore = useAuthStore()

  // Stub for Google OAuth (not implemented yet)
  const loginWithGoogle = async (token: string) => {
    console.warn('Google OAuth not yet implemented')
    throw new Error('Google OAuth not yet implemented')
  }

  return {
    // State
    currentUser: authStore.currentUser,
    authToken: authStore.authToken,
    isLoading: authStore.isLoading,
    error: authStore.error,

    // Getters
    isAuthenticated: authStore.isAuthenticated,
    hasClub: authStore.hasClub,
    isVerified: authStore.isVerified,
    isVip: authStore.isVip,

    // Actions
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    fetchMe: authStore.fetchMe,
    initialize: authStore.initialize,

    // OAuth (stub)
    loginWithGoogle,

    // Flags for register page
    isRegistering: authStore.isLoading,
    isGoogleLogging: computed(() => false),
    authError: computed(() => authStore.error ? [authStore.error] : []),
  }
}
