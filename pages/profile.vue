<template>
  <IonPage class="pp-page">
    <!-- Header -->
    <IonHeader :translucent="true" class="pp-header">
      <IonToolbar class="pp-toolbar">
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true" class="pp-content">
      <!-- Pull to refresh (only for authenticated users) -->
      <IonRefresher v-if="isAuthenticated" slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent :pulling-text="t('common.pullToRefresh')" refreshing-spinner="dots" />
      </IonRefresher>

      <!-- Profile Header (only for authenticated users) -->
      <section v-if="isAuthenticated" class="pp-profile-section">
        <div class="pp-profile-header">
          <div class="pp-avatar-container">
            <div class="pp-avatar-glow"></div>
            <IonAvatar class="pp-avatar">
              <img :src="userProfile.avatar" alt="Profile" />
            </IonAvatar>
            <IonButton fill="clear" class="pp-edit-avatar" @click="editAvatar">
              <IonIcon :icon="cameraOutline" />
            </IonButton>
          </div>
          <div class="pp-profile-info">
            <h1 class="pp-username">{{ userProfile.username }}</h1>
            <p class="pp-member-since">Member since {{ formatDate(userProfile.memberSince) }}</p>
            <div class="pp-badges">
              <div class="pp-badge pp-verified" v-if="userProfile.verified">
                <IonIcon :icon="checkmarkCircleOutline" />
                <span>Verified</span>
              </div>
              <div class="pp-badge pp-vip" v-if="userProfile.vipLevel">
                <IonIcon :icon="starOutline" />
                <span>VIP {{ userProfile.vipLevel }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Overview (only for authenticated users) -->
      <section v-if="isAuthenticated" class="pp-stats-section">
        <h2 class="pp-section-title">Your Statistics</h2>
        <div class="pp-stats-grid">
          <div class="pp-stat-card">
            <div class="pp-stat-icon">
              <IonIcon :icon="trophyOutline" />
            </div>
            <div class="pp-stat-content">
              <div class="pp-stat-value">{{ userStats.totalWins }}</div>
              <div class="pp-stat-label">Total Wins</div>
            </div>
          </div>
          <div class="pp-stat-card">
            <div class="pp-stat-icon">
              <IonIcon :icon="cashOutline" />
            </div>
            <div class="pp-stat-content">
              <div class="pp-stat-value">{{ formatCurrency(userStats.totalWinnings) }}</div>
              <div class="pp-stat-label">Total Winnings</div>
            </div>
          </div>
          <div class="pp-stat-card">
            <div class="pp-stat-icon">
              <IonIcon :icon="calendarOutline" />
            </div>
            <div class="pp-stat-content">
              <div class="pp-stat-value">{{ userStats.tournamentsPlayed }}</div>
              <div class="pp-stat-label">Tournaments</div>
            </div>
          </div>
          <div class="pp-stat-card">
            <div class="pp-stat-icon">
              <IonIcon :icon="trendingUpOutline" />
            </div>
            <div class="pp-stat-content">
              <div class="pp-stat-value">{{ userStats.winRate }}%</div>
              <div class="pp-stat-label">ITM Rate</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="pp-actions-section">
        <h2 class="pp-section-title">{{ isAuthenticated ? 'Quick Actions' : 'Get Started' }}</h2>
        <div class="pp-action-cards">
          <!-- Authenticated user actions -->
          <template v-if="isAuthenticated">
            <div class="pp-action-card" @click="viewRegistrations">
              <div class="pp-action-icon">
                <IonIcon :icon="fileTrayFullOutline" />
              </div>
              <div class="pp-action-content">
                <div class="pp-action-title">My Registrations</div>
                <div class="pp-action-subtitle">{{ upcomingRegistrations }} upcoming</div>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="pp-chevron" />
            </div>

            <div class="pp-action-card" @click="viewHistory">
              <div class="pp-action-icon">
                <IonIcon :icon="timeOutline" />
              </div>
              <div class="pp-action-content">
                <div class="pp-action-title">Tournament History</div>
                <div class="pp-action-subtitle">View past results</div>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="pp-chevron" />
            </div>

            <div class="pp-action-card" @click="viewAchievements">
              <div class="pp-action-icon">
                <IonIcon :icon="medalOutline" />
              </div>
              <div class="pp-action-content">
                <div class="pp-action-title">Achievements</div>
                <div class="pp-action-subtitle">{{ unlockedAchievements }}/{{ totalAchievements }} unlocked</div>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="pp-chevron" />
            </div>

            <div class="pp-action-card" @click="viewFriends">
              <div class="pp-action-icon">
                <IonIcon :icon="peopleOutline" />
              </div>
              <div class="pp-action-content">
                <div class="pp-action-title">Friends</div>
                <div class="pp-action-subtitle">{{ friendsCount }} friends</div>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="pp-chevron" />
            </div>
          </template>
          
          <!-- Guest user actions -->
          <template v-else>
            <div class="pp-action-card" @click="navigateTo('/login')">
              <div class="pp-action-icon">
                <IonIcon :icon="logInOutline" />
              </div>
              <div class="pp-action-content">
                <div class="pp-action-title">Login</div>
                <div class="pp-action-subtitle">Access your account</div>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="pp-chevron" />
            </div>

            <div class="pp-action-card" @click="navigateTo('/register')">
              <div class="pp-action-icon">
                <IonIcon :icon="personOutline" />
              </div>
              <div class="pp-action-content">
                <div class="pp-action-title">Register</div>
                <div class="pp-action-subtitle">Create new account</div>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="pp-chevron" />
            </div>

            <div class="pp-action-card" @click="navigateTo('/tournaments')">
              <div class="pp-action-icon">
                <IonIcon :icon="calendarOutline" />
              </div>
              <div class="pp-action-content">
                <div class="pp-action-title">Browse Tournaments</div>
                <div class="pp-action-subtitle">View upcoming events</div>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="pp-chevron" />
            </div>
          </template>
        </div>
      </section>

      <!-- Settings Panel -->
      <section class="pp-settings-section" v-if="isAuthenticated">
        <h2 class="pp-section-title">Settings</h2>
        <div class="pp-settings-list">
          <div class="pp-setting-item" @click="editProfile">
            <div class="pp-setting-icon">
              <IonIcon :icon="personOutline" />
            </div>
            <div class="pp-setting-content">
              <div class="pp-setting-title">Edit Profile</div>
              <div class="pp-setting-subtitle">Update your information</div>
            </div>
            <IonIcon :icon="chevronForwardOutline" class="pp-chevron" />
          </div>

          <div class="pp-setting-item">
            <div class="pp-setting-icon">
              <IonIcon :icon="notificationsOutline" />
            </div>
            <div class="pp-setting-content">
              <div class="pp-setting-title">Notifications</div>
              <div class="pp-setting-subtitle">Tournament alerts</div>
            </div>
            <IonToggle 
              v-model="notificationsEnabled" 
              class="pp-toggle"
            />
          </div>


          <div class="pp-setting-item" @click="logout">
            <div class="pp-setting-icon pp-logout-icon">
              <IonIcon :icon="logOutOutline" />
            </div>
            <div class="pp-setting-content">
              <div class="pp-setting-title pp-logout-text">Logout</div>
              <div class="pp-setting-subtitle">Sign out of your account</div>
            </div>
          </div>
        </div>
      </section>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonAvatar,
  IonToggle,
  IonModal,
} from '@ionic/vue'
import {
  cameraOutline,
  checkmarkCircleOutline,
  starOutline,
  trophyOutline,
  cashOutline,
  calendarOutline,
  trendingUpOutline,
  fileTrayFullOutline,
  chevronForwardOutline,
  timeOutline,
  medalOutline,
  peopleOutline,
  personOutline,
  notificationsOutline,
  logOutOutline,
} from 'ionicons/icons'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/useAuthStore'
import avatarUrl from '@/assets/images/players/70707070-7070-7070-7070-707070707070.png'

// Use custom i18n composable
const { t } = useI18n()
const router = useRouter()

// Auth state
const authStore = useAuthStore()
const { isAuthenticated, currentUser } = storeToRefs(authStore)

// Reactive data
const showEditProfile = ref(false)
const notificationsEnabled = ref(true)

// User profile data - fallback to mock data for demo
const userProfile = computed(() => {
  if (isAuthenticated.value && currentUser.value) {
    const user = currentUser.value

    // Calculate display name
    let displayName = user.username
    if (user.firstName && user.lastName) {
      displayName = `${user.firstName} ${user.lastName}`
    }

    return {
      username: displayName || user.email,
      avatar: avatarUrl,
      memberSince: new Date('2023-01-15'),
      verified: user.isActive ?? true,
      vipLevel: null,
      email: user.email,
      club: null,
    }
  }

  // Mock data for demo purposes
  return {
    username: 'Jean-Marie VDB',
    avatar: avatarUrl,
    memberSince: new Date('2023-01-15'),
    verified: true,
    vipLevel: 3,
    email: 'demo@example.com',
    club: null,
  }
})

// User statistics - mock data for demo
const userStats = ref({
  totalWins: 47,
  totalWinnings: 12850,
  tournamentsPlayed: 156,
  winRate: 34,
})

// Quick stats
const upcomingRegistrations = computed(() => isAuthenticated.value ? 3 : 0)
const unlockedAchievements = computed(() => 23)
const totalAchievements = computed(() => 45)
const friendsCount = computed(() => isAuthenticated.value ? 28 : 0)

// Methods
const handleRefresh = async (ev: CustomEvent) => {
  setTimeout(() => { (ev.target as any)?.complete?.() }, 1000)
}

const editAvatar = () => {
  console.log('Edit avatar clicked')
}

const viewRegistrations = () => {
  // Navigate to registrations page
  console.log('View registrations')
}

const viewHistory = () => {
  navigateTo('/tournament-history')
}

const viewAchievements = () => {
  console.log('View achievements')
}

const viewFriends = () => {
  navigateTo('/friends')
}

const editProfile = () => {
  showEditProfile.value = true
}

const handleProfileSave = async (profileData: any) => {
  // TODO: Wire up profile update when GQL mutation is available
  showEditProfile.value = false
}


const logout = async () => {
  try {
    await authStore.logout()
    router.replace('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', { 
    year: 'numeric', 
    month: 'long' 
  })
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString('fr-BE', { maximumFractionDigits: 0 })}€`
}
</script>

<style scoped>
.pp-page {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #18181a;
}

/* Header */
.pp-header {
  --background: rgba(24, 24, 26, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.pp-toolbar {
  --background: transparent;
  --border-color: #24242a;
  border-bottom: 1px solid #24242a;
}

.pp-title {
  color: #fee78a;
  font-weight: 700;
  font-size: 18px;
  margin: 0;
}

.pp-header-button {
  --color: #54545f;
  --color-hover: #fee78a;
  --background-hover: rgba(254, 231, 138, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* Content */
.pp-content {
  --background: #18181a;
}

/* Profile Section */
.pp-profile-section {
  padding: 20px 16px;
  border-bottom: 1px solid #24242a;
}

.pp-profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Avatar styles - profile page specific */
.pp-avatar-container {
  position: relative;
}

.pp-edit-avatar {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fee78a;
  --color: #18181a;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  margin: 0;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pp-profile-info {
  flex: 1;
}

.pp-username {
  color: #fee78a;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.pp-member-since {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.pp-badges {
  display: flex;
  gap: 8px;
}

.pp-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.pp-verified {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.pp-vip {
  background: rgba(251, 146, 60, 0.1);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

/* Sections */
.pp-stats-section,
.pp-actions-section,
.pp-settings-section {
  padding: 20px 16px;
  border-bottom: 1px solid #24242a;
}

.pp-section-title {
  color: #fee78a;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

/* Stats Grid */
.pp-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.pp-stat-card {
  background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.pp-stat-card:hover {
  border-color: #fee78a;
  transform: translateY(-2px);
}

.pp-stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(254, 231, 138, 0.1);
  border: 1px solid rgba(254, 231, 138, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fee78a;
  font-size: 20px;
}

.pp-stat-content {
  flex: 1;
}

.pp-stat-value {
  color: #fee78a;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.pp-stat-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

/* Action Cards - profile page specific layout */
.pp-action-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Profile page specific hover style */
.pp-action-card:hover {
  border-color: #fee78a;
}

/* Settings */
.pp-settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pp-setting-item {
  background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  border: 1px solid #54545f;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pp-setting-item:hover {
  border-color: #64748b;
}

.pp-setting-icon {
  width: 36px;
  height: 36px;
  background: rgba(100, 116, 139, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 18px;
}

.pp-logout-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.pp-setting-content {
  flex: 1;
}

.pp-setting-title {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.pp-logout-text {
  color: #ef4444;
}

.pp-setting-subtitle {
  color: #94a3b8;
  font-size: 12px;
}

.pp-toggle {
  --track-background: #54545f;
  --track-background-checked: #fee78a;
  --handle-background: #fff;
}

/* Animations are now in shared.css */

/* Modal Styles */
.pp-edit-modal {
  --width: 100%;
  --height: 100%;
  --border-radius: 0;
}

/* Responsive Design */
@media (max-width: 480px) {
  .pp-profile-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .pp-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .pp-username {
    font-size: 20px;
  }
}
</style>