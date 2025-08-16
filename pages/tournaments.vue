<template>
  <IonPage class="pp-page">
    <!-- Header -->
    <IonHeader :translucent="true" class="pp-header">
      <IonToolbar class="pp-toolbar">
        <IonTitle class="pp-title">{{ t('events.title') }}</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="showFilters = !showFilters" class="pp-header-button">
            <IonIcon :icon="optionsOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonToolbar class="pp-sub-toolbar">
        <ClubSelector />
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true" class="pp-content">
      <!-- Pull to refresh -->
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent :pulling-text="t('common.pullToRefresh')" refreshing-spinner="dots" />
      </IonRefresher>

      <!-- Search and Filters -->
      <section class="pp-section">
        <div class="pp-search-container">
          <IonSearchbar
            v-model="searchQuery"
            :placeholder="t('events.search.placeholder')"
            class="pp-searchbar"
            show-clear-button="focus"
          />
        </div>
        
        <!-- Filter Pills -->
        <div v-if="showFilters" class="pp-filters">
          <IonChip 
            v-for="filter in filters" 
            :key="filter.key"
            :class="selectedFilters.includes(filter.key) ? 'pp-chip-active' : 'pp-chip-inactive'"
            @click="toggleFilter(filter.key)"
          >
            <IonLabel>{{ t(`events.filters.${filter.key}`) }}</IonLabel>
          </IonChip>
        </div>
      </section>

      <!-- Tournament Categories -->
      <section class="pp-section">
        <IonSegment v-model="selectedCategory" @ionChange="onCategoryChange" class="pp-segment">
          <IonSegmentButton value="upcoming" class="pp-segment-button">
            <IonLabel>{{ t('events.categories.upcoming') }}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="live" class="pp-segment-button">
            <IonLabel>{{ t('events.categories.live') }}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="completed" class="pp-segment-button">
            <IonLabel>{{ t('events.categories.completed') }}</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </section>

      <!-- Tournament List -->
      <section class="pp-section">
        <div class="pp-tournaments-list">
          <div 
            v-for="tournament in filteredTournaments" 
            :key="tournament.id" 
            class="pp-tournament-card"
            @click="viewTournament(tournament)"
          >
            <!-- Tournament Header -->
            <div class="pp-tournament-header">
              <div class="pp-tournament-info">
                <h3 class="pp-tournament-name">{{ tournament.title || tournament.name }}</h3>
                <div class="pp-tournament-meta">
                  <IonChip v-if="tournament.type" class="pp-tournament-type" :class="`pp-type-${tournament.type}`">
                    <IonLabel>{{ t(`events.types.${tournament.type}`) }}</IonLabel>
                  </IonChip>
                  <span class="pp-tournament-club">{{ tournament.club || tournament.club?.name }}</span>
                </div>
              </div>
              <div class="pp-tournament-status">
                <IonBadge 
                  :class="getStatusClass(tournament.status)"
                  class="pp-status-badge"
                >
                  {{ t(`events.status.${tournament.status}`) }}
                </IonBadge>
              </div>
            </div>

            <!-- Tournament Details -->
            <div class="pp-tournament-details">
              <div class="pp-detail-row">
                <div class="pp-detail-item">
                  <IonIcon :icon="calendarOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ formatDate(tournament.startTime) }}</span>
                </div>
                <div class="pp-detail-item">
                  <IonIcon :icon="timeOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ formatTime(tournament.startTime) }}</span>
                </div>
              </div>
              
              <div class="pp-detail-row">
                <div class="pp-detail-item">
                  <IonIcon :icon="cashOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ t('events.buyIn') }} {{ tournament.buyIn }}</span>
                </div>
                <div class="pp-detail-item">
                  <IonIcon :icon="layersOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ tournament.structure }}</span>
                </div>
              </div>

              <div class="pp-detail-row">
                <div class="pp-detail-item">
                  <IonIcon :icon="peopleOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ tournament.registered }}/{{ tournament.maxPlayers }}</span>
                </div>
                <div class="pp-detail-item">
                  <IonIcon :icon="trophyOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ t('events.guarantee') }} {{ tournament.guarantee }}</span>
                </div>
              </div>
            </div>

            <!-- Tournament Actions -->
            <div class="pp-tournament-actions">
              <div class="pp-tournament-spots">
                <span v-if="tournament.spotsLeft > 0" class="pp-spots-text">
                  {{ t('events.spotsLeft', { count: tournament.spotsLeft }) }}
                </span>
                <span v-else class="pp-spots-full">{{ t('events.full') }}</span>
              </div>
              
              <div class="pp-action-buttons">
                <IonButton 
                  fill="clear" 
                  size="small" 
                  @click.stop="shareTournament(tournament)"
                  class="pp-button-secondary"
                >
                  <IonIcon :icon="shareOutline" />
                </IonButton>
                <!-- Registration button for authenticated users -->
                <IonButton 
                  v-if="isAuthenticated && tournament.status === 'upcoming' && tournament.spotsLeft > 0"
                  @click.stop="registerTournament(tournament)"
                  class="pp-button-primary"
                  size="small"
                >
                  {{ tournament.isRegistered ? t('events.unregister') : t('events.register') }}
                </IonButton>
                <!-- Login prompt for guests -->
                <IonButton 
                  v-else-if="!isAuthenticated && tournament.status === 'upcoming' && tournament.spotsLeft > 0"
                  @click.stop="goToLogin"
                  class="pp-button-secondary"
                  size="small"
                >
                  {{ t('events.register') }}
                </IonButton>
                <!-- Full tournament -->
                <IonButton 
                  v-else-if="tournament.status === 'upcoming'"
                  disabled
                  class="pp-button-disabled"
                  size="small"
                >
                  {{ t('events.full') }}
                </IonButton>
                <IonButton 
                  v-else-if="tournament.status === 'live'"
                  @click.stop="viewLive(tournament)"
                  class="pp-button-live"
                  size="small"
                >
                  {{ t('events.viewLive') }}
                </IonButton>
                <IonButton 
                  v-else-if="tournament.status === 'completed'"
                  @click.stop="viewResults(tournament)"
                  class="pp-button-secondary"
                  size="small"
                >
                  {{ t('events.results') }}
                </IonButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="tournamentsLoading" class="pp-loading-state">
          <IonSpinner name="dots" class="pp-loading-spinner" />
          <p class="pp-loading-text">Loading tournaments...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="tournamentsError" class="pp-error-state">
          <IonIcon :icon="alertCircleOutline" class="pp-error-icon" />
          <h3 class="pp-error-title">Error loading tournaments</h3>
          <p class="pp-error-text">Please try again later</p>
          <IonButton @click="refetchTournaments" class="pp-retry-button">
            Retry
          </IonButton>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="filteredTournaments.length === 0" class="pp-empty-state">
          <IonIcon :icon="calendarOutline" class="pp-empty-icon" />
          <h3 class="pp-empty-title">{{ t('events.empty.title') }}</h3>
          <p class="pp-empty-text">{{ t('events.empty.subtitle') }}</p>
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
  IonSearchbar,
  IonChip,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonSpinner,
} from '@ionic/vue'
import ClubSelector from '@/components/ClubSelector.vue'
import { useClubStore } from '~/stores/useClubStore'
import {
  optionsOutline,
  calendarOutline,
  timeOutline,
  cashOutline,
  layersOutline,
  peopleOutline,
  trophyOutline,
  shareOutline,
  alertCircleOutline,
} from 'ionicons/icons'
import { ref, computed, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useTournaments } from '~/composables/usePokerAPI'

// Use custom i18n composable
const { t } = useI18n()

// Authentication state
const { isAuthenticated } = useAuth()

// Reactive data
const searchQuery = ref('')
const showFilters = ref(false)
const selectedCategory = ref<'upcoming' | 'live' | 'completed'>('upcoming')
const selectedFilters = ref<string[]>([])
// Club store
const clubStore = useClubStore()

// Tournament query variables
const tournamentVariables = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return {
    clubId: clubStore.selectedClub?.id,
    from: today.toISOString(),
    to: weekFromNow.toISOString(),
    limit: 50,
    offset: 0
  }
})

// Fetch tournaments from API
const { data: tournamentsData, loading: tournamentsLoading, error: tournamentsError, refetch: refetchTournaments } = useTournaments(tournamentVariables)

// Filter options
const filters = [
  { key: 'lowStakes', label: 'Low Stakes' },
  { key: 'midStakes', label: 'Mid Stakes' },
  { key: 'highStakes', label: 'High Stakes' },
  { key: 'deepstack', label: 'Deepstack' },
  { key: 'turbo', label: 'Turbo' },
  { key: 'freezeout', label: 'Freezeout' },
]

// Get tournaments from API
const tournaments = computed(() => {
  if (!tournamentsData.value?.tournaments) return []
  
  // Map API data to display format with mock data for missing fields
  return tournamentsData.value.tournaments.map((tournament, index) => ({
    id: tournament.id,
    name: tournament.title,
    title: tournament.title,
    type: ['deepstack', 'turbo', 'freezeout', 'bounty'][index % 4], // Mock type
    status: index % 3 === 0 ? 'upcoming' : index % 3 === 1 ? 'live' : 'completed',
    club: tournament.club.name,
    clubId: tournament.club.id,
    city: tournament.club.city,
    startTime: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)), // Mock start time
    buyIn: `${(index + 1) * 25 + 25}€`, // Mock buy-in
    structure: ['20k/20min', '25k/15min', '50k/30min', '25k/25min'][index % 4],
    registered: Math.floor(Math.random() * 50) + 10,
    maxPlayers: [60, 40, 50, 80][index % 4],
    spotsLeft: Math.floor(Math.random() * 20),
    guarantee: `${(index + 1) * 1000 + 1000}€`,
    isRegistered: Math.random() > 0.7
  }))
})

// Watch for club changes and refetch
watch(() => clubStore.selectedClub, () => {
  refetchTournaments()
})

// Computed properties
const filteredTournaments = computed(() => {
  if (tournamentsLoading.value) return []
  
  let filtered = tournaments.value.filter(t => t.status === selectedCategory.value)
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.club.toLowerCase().includes(query) ||
      t.type.toLowerCase().includes(query)
    )
  }
  
  // Apply selected filters
  if (selectedFilters.value.length > 0) {
    filtered = filtered.filter(t => {
      return selectedFilters.value.some(filter => {
        switch(filter) {
          case 'lowStakes':
            return parseInt(t.buyIn.replace(/[€.]/g, '')) <= 50
          case 'midStakes':
            return parseInt(t.buyIn.replace(/[€.]/g, '')) > 50 && parseInt(t.buyIn.replace(/[€.]/g, '')) <= 100
          case 'highStakes':
            return parseInt(t.buyIn.replace(/[€.]/g, '')) > 100
          default:
            return t.type === filter
        }
      })
    })
  }
  
  return filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
})

// Methods
const toggleFilter = (filterKey: string) => {
  const index = selectedFilters.value.indexOf(filterKey)
  if (index > -1) {
    selectedFilters.value.splice(index, 1)
  } else {
    selectedFilters.value.push(filterKey)
  }
}

const onCategoryChange = (e: CustomEvent) => {
  selectedCategory.value = e.detail.value
}

const getStatusClass = (status: string) => {
  switch(status) {
    case 'upcoming': return 'pp-status-upcoming'
    case 'live': return 'pp-status-live'
    case 'completed': return 'pp-status-completed'
    default: return 'pp-status-default'
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const handleRefresh = async (ev: CustomEvent) => {
  try {
    await refetchTournaments()
  } finally {
    ;(ev.target as any)?.complete?.()
  }
}

const viewTournament = (tournament: any) => {
  // Navigate to tournament detail page
  navigateTo(`/tournament/${tournament.id}`)
}

const goToLogin = () => {
  navigateTo('/login')
}

const registerTournament = (tournament: any) => {
  // Only allow registration if authenticated
  if (!isAuthenticated.value) {
    goToLogin()
    return
  }
  
  tournament.isRegistered = !tournament.isRegistered
  if (tournament.isRegistered) {
    tournament.registered++
    tournament.spotsLeft--
  } else {
    tournament.registered--
    tournament.spotsLeft++
  }
}

const shareTournament = (tournament: any) => {
  // Share tournament functionality
  console.log('Share tournament:', tournament.id)
}

const viewLive = (tournament: any) => {
  // Navigate to live tournament view
  console.log('View live tournament:', tournament.id)
}

const viewResults = (tournament: any) => {
  // Navigate to results page
  console.log('View results:', tournament.id)
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

.pp-sub-toolbar {
  --background: transparent;
  --border-color: #24242a;
  padding: 0 16px;
  min-height: 44px;
}

.pp-title {
  color: #fee78a;
  font-weight: 700;
  font-size: 20px;
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

.pp-section {
  padding: 16px;
  margin-bottom: 8px;
}

/* Search */
.pp-search-container {
  margin-bottom: 16px;
}

.pp-searchbar {
  --background: #24242a;
  --border-radius: 12px;
  --color: #fee78a;
  --placeholder-color: #54545f;
  --icon-color: #54545f;
  --clear-button-color: #54545f;
  border: 1px solid #54545f;
}

/* Filters */
.pp-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.pp-chip-active {
  --background: linear-gradient(135deg, #64748b, #475569);
  --color: white;
  border: 1px solid #64748b;
}

.pp-chip-inactive {
  --background: rgba(84, 84, 95, 0.1);
  --color: #54545f;
  border: 1px solid #54545f;
}

/* Segment */
.pp-segment {
  --background: rgba(84, 84, 95, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
}

.pp-segment-button {
  --color: #54545f;
  --color-checked: #18181a;
  --background-checked: #fee78a;
  font-size: 14px;
  font-weight: 500;
}

/* Tournament Cards */
.pp-tournaments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pp-tournament-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pp-tournament-card:hover {
  border-color: #64748b;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(100, 116, 139, 0.15);
}

.pp-tournament-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.pp-tournament-name {
  color: #fee78a;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.pp-tournament-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pp-tournament-type {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
}

.pp-type-deepstack {
  --background: rgba(34, 197, 94, 0.2);
  --color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.pp-type-turbo {
  --background: rgba(251, 146, 60, 0.2);
  --color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.4);
}

.pp-type-freezeout {
  --background: rgba(59, 130, 246, 0.2);
  --color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.pp-type-bounty {
  --background: rgba(239, 68, 68, 0.2);
  --color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.pp-tournament-club {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
}

.pp-status-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
}

.pp-status-upcoming {
  --background: rgba(34, 197, 94, 0.2);
  --color: #22c55e;
}

.pp-status-live {
  --background: rgba(239, 68, 68, 0.2);
  --color: #ef4444;
}

.pp-status-completed {
  --background: rgba(100, 116, 139, 0.2);
  --color: #64748b;
}

.pp-tournament-details {
  margin-bottom: 16px;
}

.pp-detail-row {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.pp-detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.pp-detail-icon {
  color: #64748b;
  font-size: 16px;
}

.pp-detail-text {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
}

.pp-tournament-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pp-spots-text {
  color: #22c55e;
  font-size: 12px;
  font-weight: 500;
}

.pp-spots-full {
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
}

.pp-action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pp-button-primary {
  --background: linear-gradient(135deg, #64748b, #475569);
  --color: white;
  font-weight: 600;
  font-size: 12px;
  border-radius: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.pp-button-secondary {
  --color: #64748b;
  --color-hover: #fee78a;
  font-weight: 500;
  font-size: 12px;
  --padding-start: 12px;
  --padding-end: 12px;
}

.pp-button-live {
  --background: linear-gradient(135deg, #ef4444, #dc2626);
  --color: white;
  font-weight: 600;
  font-size: 12px;
  border-radius: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.pp-button-disabled {
  --background: rgba(84, 84, 95, 0.3);
  --color: #54545f;
  font-weight: 500;
  font-size: 12px;
  border-radius: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
}

/* Loading State */
.pp-loading-state {
  text-align: center;
  padding: 48px 24px;
}

.pp-loading-spinner {
  --color: #fee78a;
  font-size: 32px;
  margin-bottom: 16px;
}

.pp-loading-text {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 400;
  margin: 0;
}

/* Error State */
.pp-error-state {
  text-align: center;
  padding: 48px 24px;
}

.pp-error-icon {
  color: #ef4444;
  font-size: 64px;
  margin-bottom: 16px;
}

.pp-error-title {
  color: #ef4444;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.pp-error-text {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 400;
  margin: 0 0 16px 0;
}

.pp-retry-button {
  --background: linear-gradient(135deg, #64748b, #475569);
  --color: white;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
}

/* Empty State */
.pp-empty-state {
  text-align: center;
  padding: 48px 24px;
}

.pp-empty-icon {
  color: #54545f;
  font-size: 64px;
  margin-bottom: 16px;
}

.pp-empty-title {
  color: #fee78a;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.pp-empty-text {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 400;
  margin: 0;
}
</style>