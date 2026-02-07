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
            <IonLabel>
              {{ t('events.categories.upcoming') }}
              <span class="pp-segment-count">({{ tournamentCounts.upcoming }})</span>
            </IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="live" class="pp-segment-button">
            <IonLabel>
              {{ t('events.categories.live') }}
              <span class="pp-segment-count">({{ tournamentCounts.live }})</span>
            </IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="completed" class="pp-segment-button">
            <IonLabel>
              {{ t('events.categories.completed') }}
              <span class="pp-segment-count">({{ tournamentCounts.completed }})</span>
            </IonLabel>
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
                <h3 class="pp-tournament-name">{{ tournament.title }}</h3>
                <div class="pp-tournament-meta">
                  <span class="pp-tournament-club">{{ clubStore.selectedClub?.name }}</span>
                </div>
              </div>
              <div class="pp-tournament-status">
                <IonBadge
                  :class="getStatusClass(tournament.status)"
                  class="pp-status-badge"
                >
                  {{ tournament.liveStatus ? t(`events.status.${tournament.liveStatus.toLowerCase()}`) : t(`events.status.${tournament.status.toLowerCase()}`) }}
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
                  <span class="pp-detail-text">{{ t('events.buyIn') }} {{ currencyCents(tournament.buyInCents) }}</span>
                </div>
                <div v-if="tournament.seatCap" class="pp-detail-item">
                  <IonIcon :icon="peopleOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ t('events.maxPlayers', { count: tournament.seatCap }) }}</span>
                </div>
              </div>
            </div>

            <!-- Tournament Actions -->
            <div class="pp-tournament-actions" :class="{ 'pp-actions-completed': tournament.status === 'completed' }">
              <div class="pp-action-buttons">
                <IonButton
                  v-if="tournament.status === 'live'"
                  @click.stop="viewLive(tournament)"
                  class="pp-action-button pp-action-button--danger"
                  size="small"
                >
                  {{ t('events.viewLive') }}
                </IonButton>
                <IonButton
                  v-else-if="tournament.status === 'completed'"
                  @click.stop="viewResults(tournament)"
                  class="pp-action-button pp-action-button--secondary"
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
          <p class="pp-loading-text">{{ t('events.loadingDetails') }}</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="tournamentsError" class="pp-error-state">
          <IonIcon :icon="alertCircleOutline" class="pp-error-icon" />
          <h3 class="pp-error-title">{{ t('common.errorLoading') }}</h3>
          <p class="pp-error-text">{{ t('common.tryAgainLater') }}</p>
          <IonButton @click="refetchTournaments" class="pp-action-button pp-action-button--retry">
            {{ t('common.retry') }}
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
  peopleOutline,
  alertCircleOutline,
} from 'ionicons/icons'
import { currencyCents } from '~/utils/currency'
import type { TournamentLiveStatus } from '~/types/tournament'
import { ref, computed } from 'vue'

interface DisplayTournament {
  id: string
  title: string
  status: 'upcoming' | 'live' | 'completed'
  liveStatus: TournamentLiveStatus
  startTime: Date
  buyInCents: number
  seatCap: number | null
  description: string | null
}

// Use custom i18n composable
const { t, locale } = useI18n()

// Reactive data
const searchQuery = ref('')
const showFilters = ref(false)
const selectedCategory = ref<'upcoming' | 'live' | 'completed'>('upcoming')
const selectedFilters = ref<string[]>([])
// Club store
const clubStore = useClubStore()

// Fetch tournaments from API using useLazyAsyncData
const { data: tournamentsResponse, status: tournamentsStatus, error: tournamentsError, refresh: refetchTournaments } = useLazyAsyncData(
  'tournaments',
  () => GqlGetTournaments({
    clubId: clubStore.selectedClub?.id,
    limit: 50,
    offset: 0
  }),
  { watch: [() => clubStore.selectedClub] }
)

const tournamentsLoading = computed(() => tournamentsStatus.value === 'pending')
const tournamentsData = computed(() => tournamentsResponse.value?.tournaments || [])

// Filter options
const filters = [
  { key: 'lowStakes', label: 'Low Stakes' },
  { key: 'midStakes', label: 'Mid Stakes' },
  { key: 'highStakes', label: 'High Stakes' },
]

// Map API data to display format
const tournaments = computed(() => {
  if (!tournamentsData.value.length) return []

  return tournamentsData.value.map((tournament): DisplayTournament => {
    const uiStatus = tournament.status.toLowerCase() as 'upcoming' | 'in_progress' | 'completed'

    return {
      id: tournament.id,
      title: tournament.title,
      status: uiStatus === 'in_progress' ? 'live' : uiStatus,
      liveStatus: tournament.liveStatus,
      startTime: new Date(tournament.startTime),
      buyInCents: tournament.buyInCents,
      seatCap: tournament.seatCap,
      description: tournament.description
    }
  })
})

// Club change watching is handled by useLazyAsyncData's watch option

// Tournament counts by category
const tournamentCounts = computed(() => {
  if (tournamentsLoading.value || !tournaments.value) return { upcoming: 0, live: 0, completed: 0 }
  
  return {
    upcoming: tournaments.value.filter(t => t.status === 'upcoming').length,
    live: tournaments.value.filter(t => t.status === 'live').length,
    completed: tournaments.value.filter(t => t.status === 'completed').length
  }
})

// Computed properties
const filteredTournaments = computed(() => {
  if (tournamentsLoading.value) return []

  let filtered = tournaments.value.filter(t => t.status === selectedCategory.value)

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(query)
    )
  }

  // Apply selected filters (stake-based)
  if (selectedFilters.value.length > 0) {
    filtered = filtered.filter(t => {
      const buyInEuros = t.buyInCents / 100
      return selectedFilters.value.some(filter => {
        switch(filter) {
          case 'lowStakes':
            return buyInEuros <= 50
          case 'midStakes':
            return buyInEuros > 50 && buyInEuros <= 100
          case 'highStakes':
            return buyInEuros > 100
          default:
            return false
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
  return date.toLocaleDateString(locale.value, { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString(locale.value, { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const handleRefresh = async (ev: CustomEvent) => {
  try {
    await refetchTournaments()
  } finally {
    ;(ev.target as HTMLIonRefresherElement)?.complete?.()
  }
}

const viewTournament = (tournament: DisplayTournament) => {
  navigateTo(`/tournament/${tournament.id}`)
}

const viewLive = (tournament: DisplayTournament) => {
  navigateTo(`/tournament/${tournament.id}`)
}

const viewResults = (tournament: DisplayTournament) => {
  navigateTo(`/tournament/${tournament.id}`)
}
</script>

<style scoped>
/* Tournaments page specific styles */

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

/* Filters - tournaments page specific */
.pp-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

/* Segment - tournaments specific font size */
.pp-segment-button {
  font-size: 14px;
}

.pp-segment-count {
  opacity: 0.7;
  font-size: 12px;
  font-weight: 400;
  margin-left: 4px;
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

.pp-tournament-club {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
}

/* Status badges are now in shared.css */

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

.pp-actions-completed {
  justify-content: flex-end;
}

.pp-action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Buttons are now in shared.css */

/* Loading, Error and Empty states are now in shared.css */
</style>