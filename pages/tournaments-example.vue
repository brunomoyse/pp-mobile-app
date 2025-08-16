<template>
  <IonPage class="pp-page">
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

      <!-- Loading State -->
      <section v-if="tournamentsLoading" class="pp-section">
        <div class="pp-loading">
          <IonSpinner name="dots" />
          <p>Loading tournaments...</p>
        </div>
      </section>

      <!-- Error State -->
      <section v-else-if="tournamentsError" class="pp-section">
        <div class="pp-error">
          <IonIcon :icon="alertCircleOutline" />
          <h3>Error Loading Tournaments</h3>
          <p>{{ tournamentsError[0]?.message || 'Something went wrong' }}</p>
          <IonButton @click="refreshTournaments" fill="clear" color="primary">
            Try Again
          </IonButton>
        </div>
      </section>

      <!-- Tournament List -->
      <section v-else class="pp-section">
        <div class="pp-tournaments-list" v-if="filteredTournaments.length > 0">
          <div 
            v-for="tournament in filteredTournaments" 
            :key="tournament.id" 
            class="pp-tournament-card"
            @click="viewTournament(tournament)"
          >
            <!-- Tournament Header -->
            <div class="pp-tournament-header">
              <div class="pp-tournament-info">
                <h3 class="pp-tournament-name">{{ tournament.name }}</h3>
                <div class="pp-tournament-meta">
                  <IonChip class="pp-tournament-type" :class="`pp-type-${tournament.type}`">
                    <IonLabel>{{ t(`events.types.${tournament.type}`) }}</IonLabel>
                  </IonChip>
                  <span class="pp-tournament-club">{{ tournament.club.name }}</span>
                </div>
              </div>
              <div class="pp-tournament-status">
                <IonBadge 
                  :class="getStatusClass(tournament.status)"
                  class="pp-status-badge"
                >
                  {{ t(`events.status.${tournament.status.toLowerCase()}`) }}
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
                  <span class="pp-detail-text">{{ formatCurrency(tournament.buyIn) }}</span>
                </div>
                <div class="pp-detail-item">
                  <IonIcon :icon="peopleOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">
                    {{ tournament.registeredPlayers }}{{ tournament.maxPlayers ? `/${tournament.maxPlayers}` : '' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Tournament Actions -->
            <div class="pp-tournament-actions">
              <IonButton 
                v-if="tournament.status === 'upcoming'"
                @click.stop="registerForTournament(tournament.id)"
                :disabled="registering"
                class="pp-register-button"
                fill="solid"
                size="small"
              >
                <IonIcon v-if="registering" :icon="hourglass" slot="start" />
                <IonIcon v-else :icon="addOutline" slot="start" />
                Register
              </IonButton>
              <IonButton 
                v-else
                @click.stop="viewTournament(tournament)"
                class="pp-view-button"
                fill="outline"
                size="small"
              >
                <IonIcon :icon="eyeOutline" slot="start" />
                View Details
              </IonButton>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="pp-empty-state">
          <IonIcon :icon="calendarOutline" class="pp-empty-icon" />
          <h3 class="pp-empty-title">No Tournaments Found</h3>
          <p class="pp-empty-description">
            No tournaments match your current filters. Try adjusting your search criteria.
          </p>
        </div>

        <!-- Load More Button -->
        <div v-if="hasNextPage" class="pp-load-more">
          <IonButton 
            @click="loadMore"
            :disabled="tournamentsLoading"
            fill="clear"
            expand="block"
          >
            <IonIcon v-if="tournamentsLoading" :icon="hourglass" slot="start" />
            Load More Tournaments
          </IonButton>
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
import {
  optionsOutline,
  calendarOutline,
  timeOutline,
  cashOutline,
  peopleOutline,
  addOutline,
  eyeOutline,
  alertCircleOutline,
  hourglass,
} from 'ionicons/icons'
import { ref, computed, watch } from 'vue'
import ClubSelector from '@/components/ClubSelector.vue'
import { useClubStore } from '~/stores/useClubStore'
import { usePaginatedTournaments, useTournamentRegistration } from '@/composables/usePokerAPI'
import type { Tournament } from '@/types/graphql'

// Use custom i18n composable
const { t } = useI18n()

// Reactive data
const searchQuery = ref('')
const showFilters = ref(false)
const selectedCategory = ref<'upcoming' | 'live' | 'completed'>('upcoming')
const selectedFilters = ref<string[]>([])
const clubStore = useClubStore()

// Filter options
const filters = [
  { key: 'lowStakes', label: 'Low Stakes' },
  { key: 'midStakes', label: 'Mid Stakes' },
  { key: 'highStakes', label: 'High Stakes' },
  { key: 'turbo', label: 'Turbo' },
  { key: 'deepstack', label: 'Deep Stack' },
]

// GraphQL Data Fetching
const clubIdRef = computed(() => clubStore.selectedClub?.id)

const {
  data: tournamentsData,
  loading: tournamentsLoading,
  error: tournamentsError,
  refetch: refetchTournaments,
  refresh: refreshTournaments,
  nextPage,
  hasNextPage,
} = usePaginatedTournaments(clubIdRef)

// Tournament Registration
const {
  register: registerForTournament,
  registering,
  error: registrationError,
} = useTournamentRegistration()

// Computed properties
const tournaments = computed(() => tournamentsData.value?.tournaments || [])

const filteredTournaments = computed(() => {
  let filtered = tournaments.value

  // Filter by status/category
  filtered = filtered.filter(tournament => tournament.status === selectedCategory.value)

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(tournament =>
      tournament.name.toLowerCase().includes(query) ||
      tournament.club.name.toLowerCase().includes(query)
    )
  }

  // Filter by selected filters
  if (selectedFilters.value.length > 0) {
    filtered = filtered.filter(tournament => {
      return selectedFilters.value.every(filter => {
        switch (filter) {
          case 'lowStakes':
            return tournament.buyIn <= 50
          case 'midStakes':
            return tournament.buyIn > 50 && tournament.buyIn <= 200
          case 'highStakes':
            return tournament.buyIn > 200
          case 'turbo':
            return tournament.type === 'turbo'
          case 'deepstack':
            return tournament.type === 'deepstack'
          default:
            return true
        }
      })
    })
  }

  return filtered
})

// Methods
const handleRefresh = async (ev: CustomEvent) => {
  await refreshTournaments()
  ;(ev.target as any)?.complete?.()
}

const loadMore = () => {
  nextPage()
}

const toggleFilter = (filterKey: string) => {
  const index = selectedFilters.value.indexOf(filterKey)
  if (index > -1) {
    selectedFilters.value.splice(index, 1)
  } else {
    selectedFilters.value.push(filterKey)
  }
}

const onCategoryChange = (event: any) => {
  selectedCategory.value = event.detail.value
}

const viewTournament = (tournament: Tournament) => {
  navigateTo(`/tournament/${tournament.id}`)
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'pp-status-upcoming'
    case 'live':
      return 'pp-status-live'
    case 'completed':
      return 'pp-status-completed'
    default:
      return 'pp-status-default'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString('fr-BE', { maximumFractionDigits: 0 })}€`
}

// Watch for club changes to refetch data
watch(() => clubStore.selectedClub, () => {
  refreshTournaments()
})
</script>

<style scoped>
/* Add your existing styles here, plus these new ones for loading/error states */

.pp-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
  color: #94a3b8;
}

.pp-loading ion-spinner {
  margin-bottom: 16px;
}

.pp-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
  color: #ef4444;
}

.pp-error ion-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.pp-error h3 {
  margin: 0 0 8px 0;
  color: #ef4444;
}

.pp-error p {
  margin: 0 0 16px 0;
  color: #94a3b8;
}

.pp-load-more {
  padding: 16px;
  text-align: center;
}

.pp-tournament-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #24242a;
  display: flex;
  gap: 8px;
}

.pp-register-button {
  --background: #fee78a;
  --color: #18181a;
  font-weight: 600;
}

.pp-view-button {
  --color: #64748b;
  --border-color: #54545f;
}
</style>