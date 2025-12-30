import { useAuthStore } from '~/stores/useAuthStore'

export const useAuth = () => {
  const authStore = useAuthStore()

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
    logout: authStore.logout,
    fetchMe: authStore.fetchMe,
    initialize: authStore.initialize,
  }
}
