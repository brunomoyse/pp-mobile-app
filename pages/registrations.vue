<template>
  <IonPage class="pp-page">
    <!-- Header -->
    <IonHeader :translucent="true" class="pp-header">
      <IonToolbar class="pp-toolbar">
        <IonTitle class="pp-title">{{ t('mySeats.title') }}</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="showFilters = !showFilters" class="pp-header-button">
            <IonIcon :icon="optionsOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true" class="pp-content">
      <!-- Pull to refresh -->
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent :pulling-text="t('common.pullToRefresh')" refreshing-spinner="dots" />
      </IonRefresher>

      <!-- Quick Stats -->
      <section class="pp-section">
        <div class="pp-stats-container">
          <div class="pp-stat-card">
            <div class="pp-stat-value">{{ registeredCount }}</div>
            <div class="pp-stat-label">{{ t('mySeats.stats.registered') }}</div>
          </div>
          <div class="pp-stat-card">
            <div class="pp-stat-value">{{ totalInvestment }}€</div>
            <div class="pp-stat-label">{{ t('mySeats.stats.investment') }}</div>
          </div>
          <div class="pp-stat-card">
            <div class="pp-stat-value">{{ upcomingCount }}</div>
            <div class="pp-stat-label">{{ t('mySeats.stats.upcoming') }}</div>
          </div>
        </div>
      </section>

      <!-- Filter Pills -->
      <section v-if="showFilters" class="pp-section">
        <div class="pp-filters">
          <IonChip 
            v-for="filter in filters" 
            :key="filter.key"
            :class="selectedFilters.includes(filter.key) ? 'pp-chip-active' : 'pp-chip-inactive'"
            @click="toggleFilter(filter.key)"
          >
            <IonLabel>{{ t(`mySeats.filters.${filter.key}`) }}</IonLabel>
          </IonChip>
        </div>
      </section>

      <!-- Registration Categories -->
      <section class="pp-section">
        <IonSegment v-model="selectedCategory" @ionChange="onCategoryChange" class="pp-segment">
          <IonSegmentButton value="upcoming" class="pp-segment-button">
            <IonLabel>{{ t('mySeats.categories.upcoming') }}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="live" class="pp-segment-button">
            <IonLabel>{{ t('mySeats.categories.live') }}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="completed" class="pp-segment-button">
            <IonLabel>{{ t('mySeats.categories.completed') }}</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </section>

      <!-- My Registrations List -->
      <section class="pp-section">
        <div class="pp-registrations-list">
          <div 
            v-for="registration in filteredRegistrations" 
            :key="registration.id" 
            class="pp-registration-card"
            @click="viewRegistration(registration)"
          >
            <!-- Registration Header -->
            <div class="pp-registration-header">
              <div class="pp-registration-info">
                <h3 class="pp-registration-name">{{ registration.tournamentName }}</h3>
                <div class="pp-registration-meta">
                  <IonChip class="pp-registration-type" :class="`pp-type-${registration.type}`">
                    <IonLabel>{{ t(`mySeats.types.${registration.type}`) }}</IonLabel>
                  </IonChip>
                  <span class="pp-registration-club">{{ registration.club }}</span>
                </div>
              </div>
              <div class="pp-registration-status">
                <IonBadge 
                  :class="getStatusClass(registration.status)"
                  class="pp-status-badge"
                >
                  {{ t(`mySeats.status.${registration.status}`) }}
                </IonBadge>
              </div>
            </div>

            <!-- Registration Details -->
            <div class="pp-registration-details">
              <div class="pp-detail-row">
                <div class="pp-detail-item">
                  <IonIcon :icon="calendarOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ formatDate(registration.startTime) }}</span>
                </div>
                <div class="pp-detail-item">
                  <IonIcon :icon="timeOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ formatTime(registration.startTime) }}</span>
                </div>
              </div>
              
              <div class="pp-detail-row">
                <div class="pp-detail-item">
                  <IonIcon :icon="cashOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ t('mySeats.buyIn') }} {{ registration.buyIn }}</span>
                </div>
                <div class="pp-detail-item">
                  <IonIcon :icon="ticketOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text"># {{ registration.seatNumber }}</span>
                </div>
              </div>

              <div class="pp-detail-row">
                <div class="pp-detail-item">
                  <IonIcon :icon="locationOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ registration.table ? `Table ${registration.table}` : t('mySeats.tableNotAssigned') }}</span>
                </div>
                <div class="pp-detail-item" v-if="registration.position">
                  <IonIcon :icon="trophyOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ t('mySeats.position') }} #{{ registration.position }}</span>
                </div>
              </div>

              <!-- Registration Date -->
              <div class="pp-registration-date">
                <IonIcon :icon="checkmarkCircleOutline" class="pp-registration-date-icon" />
                <span class="pp-registration-date-text">
                  {{ t('mySeats.registeredOn') }} {{ formatDateTime(registration.registeredAt) }}
                </span>
              </div>
            </div>

            <!-- Registration Actions -->
            <div class="pp-registration-actions">
              <div class="pp-registration-investment">
                <span class="pp-investment-label">{{ t('mySeats.investment') }}</span>
                <span class="pp-investment-value">{{ registration.buyIn }}</span>
              </div>
              
              <div class="pp-action-buttons">
                <IonButton 
                  fill="clear" 
                  size="small" 
                  @click.stop="shareRegistration(registration)"
                  class="pp-button-secondary"
                >
                  <IonIcon :icon="shareOutline" />
                </IonButton>
                
                <IonButton 
                  v-if="registration.status === 'upcoming' && canCancel(registration)"
                  @click.stop="cancelRegistration(registration)"
                  class="pp-button-warning"
                  size="small"
                >
                  {{ t('mySeats.cancel') }}
                </IonButton>
                
                <IonButton 
                  v-else-if="registration.status === 'live'"
                  @click.stop="viewLive(registration)"
                  class="pp-button-live"
                  size="small"
                >
                  {{ t('mySeats.viewLive') }}
                </IonButton>
                
                <IonButton 
                  v-else-if="registration.status === 'completed'"
                  @click.stop="viewResult(registration)"
                  class="pp-button-secondary"
                  size="small"
                >
                  {{ t('mySeats.viewResult') }}
                </IonButton>

                <IonButton 
                  v-if="registration.status === 'upcoming'"
                  @click.stop="modifyRegistration(registration)"
                  class="pp-button-primary"
                  size="small"
                >
                  {{ t('mySeats.modify') }}
                </IonButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredRegistrations.length === 0" class="pp-empty-state">
          <IonIcon :icon="ticketOutline" class="pp-empty-icon" />
          <h3 class="pp-empty-title">{{ t('mySeats.empty.title') }}</h3>
          <p class="pp-empty-text">{{ t('mySeats.empty.subtitle') }}</p>
          <IonButton @click="$router.push('/tournaments')" class="pp-button-primary">
            {{ t('mySeats.empty.browseEvents') }}
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
  IonChip,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonBadge,
} from '@ionic/vue'
import {
  optionsOutline,
  calendarOutline,
  timeOutline,
  cashOutline,
  ticketOutline,
  locationOutline,
  trophyOutline,
  checkmarkCircleOutline,
  shareOutline,
} from 'ionicons/icons'
import { ref, computed } from 'vue'

// Use custom i18n composable
const { t } = useI18n()

// Reactive data
const showFilters = ref(false)
const selectedCategory = ref<'upcoming' | 'live' | 'completed'>('upcoming')
const selectedFilters = ref<string[]>([])

// Filter options
const filters = [
  { key: 'canCancel', label: 'Cancelable' },
  { key: 'lateReg', label: 'Late Registration' },
  { key: 'highStakes', label: 'High Stakes' },
  { key: 'deepstack', label: 'Deepstack' },
  { key: 'turbo', label: 'Turbo' },
]

// Mock registration data
const registrations = ref([
  {
    id: 'R001',
    tournamentId: 'T002',
    tournamentName: 'Wednesday Turbo',
    type: 'turbo',
    status: 'upcoming',
    club: 'Liège Poker Club',
    startTime: new Date('2025-08-14T20:30:00'),
    buyIn: '30€',
    seatNumber: '4B',
    table: null,
    position: null,
    registeredAt: new Date('2025-08-10T14:22:00'),
    canCancelUntil: new Date('2025-08-14T18:30:00')
  },
  {
    id: 'R002',
    tournamentId: 'T004',
    tournamentName: 'Thursday Bounty Hunter',
    type: 'bounty',
    status: 'live',
    club: 'Pokah Room Antwerp',
    startTime: new Date('2025-08-12T19:00:00'),
    buyIn: '75€',
    seatNumber: '7A',
    table: 3,
    position: null,
    registeredAt: new Date('2025-08-09T16:45:00'),
    canCancelUntil: new Date('2025-08-12T17:00:00')
  },
  {
    id: 'R003',
    tournamentId: 'T005',
    tournamentName: 'Monday Night Special',
    type: 'deepstack',
    status: 'completed',
    club: 'Liège Poker Club',
    startTime: new Date('2025-08-11T19:30:00'),
    buyIn: '40€',
    seatNumber: '2C',
    table: 1,
    position: 8,
    registeredAt: new Date('2025-08-08T12:30:00'),
    canCancelUntil: new Date('2025-08-11T17:30:00'),
    payout: 0
  },
  {
    id: 'R004',
    tournamentId: 'T001',
    tournamentName: 'Tuesday Night Deepstack',
    type: 'deepstack',
    status: 'upcoming',
    club: 'Pokah Room Antwerp',
    startTime: new Date('2025-08-13T19:00:00'),
    buyIn: '50€',
    seatNumber: '1A',
    table: null,
    position: null,
    registeredAt: new Date('2025-08-11T10:15:00'),
    canCancelUntil: new Date('2025-08-13T17:00:00')
  }
])

// Computed properties
const filteredRegistrations = computed(() => {
  let filtered = registrations.value.filter(r => r.status === selectedCategory.value)
  
  // Apply selected filters
  if (selectedFilters.value.length > 0) {
    filtered = filtered.filter(r => {
      return selectedFilters.value.some(filter => {
        switch(filter) {
          case 'canCancel':
            return r.status === 'upcoming' && canCancel(r)
          case 'lateReg':
            return r.registeredAt > new Date(r.startTime.getTime() - 24 * 60 * 60 * 1000)
          case 'highStakes':
            return parseInt(r.buyIn.replace(/[€.]/g, '')) > 100
          default:
            return r.type === filter
        }
      })
    })
  }
  
  return filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
})

const registeredCount = computed(() => registrations.value.length)

const totalInvestment = computed(() => {
  return registrations.value.reduce((total, reg) => {
    return total + parseInt(reg.buyIn.replace(/[€.]/g, ''))
  }, 0)
})

const upcomingCount = computed(() => {
  return registrations.value.filter(r => r.status === 'upcoming').length
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

const canCancel = (registration: any) => {
  return new Date() < new Date(registration.canCancelUntil)
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

const formatDateTime = (date: Date) => {
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleRefresh = async (ev: CustomEvent) => {
  setTimeout(() => { (ev.target as any)?.complete?.() }, 1000)
}

const viewRegistration = (registration: any) => {
  console.log('View registration:', registration.id)
}

const cancelRegistration = (registration: any) => {
  console.log('Cancel registration:', registration.id)
  // Add confirmation dialog here
}

const modifyRegistration = (registration: any) => {
  console.log('Modify registration:', registration.id)
}

const shareRegistration = (registration: any) => {
  console.log('Share registration:', registration.id)
}

const viewLive = (registration: any) => {
  console.log('View live registration:', registration.id)
}

const viewResult = (registration: any) => {
  console.log('View result:', registration.id)
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

/* Stats Container */
.pp-stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.pp-stat-card {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.08), rgba(71, 85, 105, 0.08));
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.pp-stat-card:hover {
  border-color: rgba(100, 116, 139, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(100, 116, 139, 0.15);
}

.pp-stat-value {
  color: #fee78a;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pp-stat-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filters */
.pp-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pp-chip-active {
  --background: linear-gradient(135deg, #64748b, #475569);
  --color: white;
  border: 1px solid #64748b;
  padding: 4px 8px;
}

.pp-chip-inactive {
  --background: rgba(84, 84, 95, 0.1);
  --color: #54545f;
  border: 1px solid #54545f;
  padding: 4px 8px;
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

/* Registration Cards */
.pp-registrations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pp-registration-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pp-registration-card:hover {
  border-color: #64748b;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(100, 116, 139, 0.15);
}

.pp-registration-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.pp-registration-name {
  color: #fee78a;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.pp-registration-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pp-registration-type {
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

.pp-type-bounty {
  --background: rgba(239, 68, 68, 0.2);
  --color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.pp-registration-club {
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

.pp-registration-details {
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

.pp-registration-date {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(84, 84, 95, 0.2);
}

.pp-registration-date-icon {
  color: #22c55e;
  font-size: 16px;
}

.pp-registration-date-text {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 400;
}

.pp-registration-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pp-registration-investment {
  display: flex;
  flex-direction: column;
}

.pp-investment-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 400;
}

.pp-investment-value {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
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

.pp-button-warning {
  --background: linear-gradient(135deg, #f59e0b, #d97706);
  --color: white;
  font-weight: 600;
  font-size: 12px;
  border-radius: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
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
  margin: 0 0 24px 0;
}
</style>