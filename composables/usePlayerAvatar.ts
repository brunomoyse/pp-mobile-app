export const usePlayerAvatar = () => {
  // Simple function that returns the avatar path - error handling is done in the template
  const getPlayerAvatar = (userId: string | undefined): string => {
    if (!userId) {
      // Return fallback avatar if no userId
      return '/images/players/70707070-7070-7070-7070-707070707070.png'
    }
    
    // Return the jpg path - the template will handle errors and try .png
    return `/images/players/${userId}.jpg`
  }

  const getPlayerAvatarWithFallback = (userId: string | undefined): string => {
    if (!userId) {
      return '/images/players/70707070-7070-7070-7070-707070707070.png'
    }
    
    // Return jpg path as primary, the browser will handle 404 gracefully
    // with our onError handler in the template
    return `/images/players/${userId}.jpg`
  }

  return {
    getPlayerAvatar,
    getPlayerAvatarWithFallback
  }
}