<template>
  <IonPage class="pp-page">
    <!-- Header -->
    <IonHeader :translucent="true" class="pp-header">
      <IonToolbar class="pp-toolbar">
        <IonButtons slot="start">
          <IonButton @click="$router.back()" class="pp-header-button">
            <IonIcon :icon="arrowBackOutline" />
          </IonButton>
        </IonButtons>
        <IonTitle class="pp-title">PocketPair</IonTitle>
        <IonButtons slot="end">
          <IonButton class="pp-header-button">
            <IonIcon :icon="personCircleOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true" class="pp-content">
      <!-- Pull to refresh -->
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent :pulling-text="t('common.pullToRefresh')" refreshing-spinner="dots" />
      </IonRefresher>

      <!-- Event Info Section -->
      <section class="pp-event-section">
        <h1 class="pp-event-title">{{ eventInfo.title }}</h1>
        <p class="pp-event-subtitle">{{ eventInfo.dateRange }}</p>
      </section>

      <!-- Search Bar -->
      <section class="pp-search-section">
        <IonSearchbar
          v-model="searchQuery"
          placeholder="Search for a tournament…"
          class="pp-searchbar"
          show-clear-button="focus"
        >
          <IonIcon :icon="searchOutline" slot="start" />
        </IonSearchbar>
      </section>

      <!-- Tournament Cards by Date -->
      <section class="pp-tournaments-section">
        <div class="pp-tournaments-container">
          <div 
            v-for="dateGroup in groupedTournaments" 
            :key="dateGroup.date"
            class="pp-date-group"
          >
            <!-- Date Header -->
            <div 
              class="pp-date-header"
              @click="toggleDateGroup(dateGroup.date)"
            >
              <div class="pp-date-badge">
                <span class="pp-date-text">{{ formatDateOnly(dateGroup.date) }}</span>
                <span class="pp-date-subtitle">{{ formatWeekday(dateGroup.date) }} • {{ dateGroup.tournaments.length }} tournaments</span>
              </div>
              <IonIcon 
                :icon="dateGroup.expanded ? removeOutline : addOutline" 
                class="pp-expand-icon"
              />
            </div>

            <!-- Tournament Cards -->
            <div v-if="dateGroup.expanded" class="pp-tournament-cards">
              <div 
                v-for="tournament in dateGroup.tournaments"
                :key="tournament.id"
                class="pp-tournament-card"
                @click="viewTournament(tournament)"
              >
                <!-- Card Header -->
                <div class="pp-card-header">
                  <div class="pp-card-left">
                    <div class="pp-time-badge">
                      <div 
                        class="pp-status-dot"
                        :class="getStatusCircleClass(tournament.status)"
                      ></div>
                      <span class="pp-time">{{ formatTime(tournament.startTime) }}</span>
                    </div>
                    <h3 class="pp-tournament-title">{{ tournament.name }}</h3>
                  </div>
                  <div class="pp-card-right">
                    <div class="pp-entries-badge">
                      <span class="pp-entries-number">{{ tournament.registered }}</span>
                      <span class="pp-entries-label">entries</span>
                    </div>
                  </div>
                </div>

                <!-- Card Details -->
                <div class="pp-card-details">
                  <div class="pp-detail-chips">
                    <div class="pp-chip pp-buyin-chip">
                      <IonIcon :icon="cashOutline" />
                      <span>{{ tournament.buyIn }}</span>
                    </div>
                    <div class="pp-chip pp-stack-chip">
                      <IonIcon :icon="layersOutline" />
                      <span>{{ tournament.structure }}</span>
                    </div>
                    <div class="pp-chip pp-seats-chip">
                      <IonIcon :icon="peopleOutline" />
                      <span>{{ tournament.spotsLeft }} seats left</span>
                    </div>
                  </div>
                </div>

                <!-- Card Footer -->
                <div class="pp-card-footer">
                  <div class="pp-registration-info">
                    <IonIcon :icon="timeOutline" class="pp-clock-icon" />
                    <span class="pp-reg-text">Registration closes</span>
                    <span class="pp-reg-time">{{ formatDateTime(tournament.registrationClose) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="groupedTournaments.length === 0" class="pp-empty-state">
          <IonIcon :icon="calendarOutline" class="pp-empty-icon" />
          <h3 class="pp-empty-title">No tournaments found</h3>
          <p class="pp-empty-text">Try adjusting your search or check back later</p>
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
} from '@ionic/vue'
import {
  arrowBackOutline,
  personCircleOutline,
  searchOutline,
  calendarOutline,
  timeOutline,
  addOutline,
  removeOutline,
  cashOutline,
  layersOutline,
  peopleOutline,
} from 'ionicons/icons'
import { ref, computed } from 'vue'

// Use custom i18n composable
const { t } = useI18n()

// Reactive data
const searchQuery = ref('')

// Event info
const eventInfo = ref({
  title: "PokhaNights Open 2025",
  dateRange: "21-31 August 2025"
})

// Date groups state
const dateGroupsExpanded = ref<{ [key: string]: boolean }>({});

// Mock tournament data
const tournaments = ref([
  {
    id: 'PO001',
    eventNumber: 1,
    name: 'PokhaNights Open Opening Event',
    status: 'upcoming',
    startTime: new Date('2025-08-21T19:00:00'),
    registrationClose: new Date('2025-08-21T22:00:00'),
    buyIn: '75€',
    structure: '25k/30min',
    registered: 89,
    maxPlayers: 150,
    spotsLeft: 61,
  },
  {
    id: 'PO002', 
    eventNumber: 2,
    name: 'Mini Main Event Day 1A',
    status: 'upcoming',
    startTime: new Date('2025-08-21T20:00:00'),
    registrationClose: new Date('2025-08-22T02:00:00'),
    buyIn: '250€',
    structure: '50k/40min',
    registered: 156,
    maxPlayers: 300,
    spotsLeft: 144,
  },
  {
    id: 'PO003',
    eventNumber: 3,
    name: 'Mini Main Event Day 1B',
    status: 'upcoming',
    startTime: new Date('2025-08-22T15:00:00'),
    registrationClose: new Date('2025-08-22T21:00:00'),
    buyIn: '250€',
    structure: '50k/40min',
    registered: 203,
    maxPlayers: 300,
    spotsLeft: 97,
  },
  {
    id: 'PO004',
    eventNumber: 4,
    name: 'Bounty Hunter Progressive',
    status: 'upcoming',
    startTime: new Date('2025-08-22T19:00:00'),
    registrationClose: new Date('2025-08-22T22:30:00'),
    buyIn: '125€',
    structure: '30k/25min',
    registered: 78,
    maxPlayers: 120,
    spotsLeft: 42,
  },
  {
    id: 'PO005',
    eventNumber: 5,
    name: 'Mini Main Event Day 1C (Turbo)',
    status: 'upcoming',
    startTime: new Date('2025-08-23T15:00:00'),
    registrationClose: new Date('2025-08-23T19:00:00'),
    buyIn: '250€',
    structure: '50k/20min',
    registered: 167,
    maxPlayers: 300,
    spotsLeft: 133,
  },
  {
    id: 'PO006',
    eventNumber: 6,
    name: 'Ladies Event',
    status: 'upcoming',
    startTime: new Date('2025-08-23T19:00:00'),
    registrationClose: new Date('2025-08-23T22:00:00'),
    buyIn: '100€',
    structure: '25k/30min',
    registered: 34,
    maxPlayers: 80,
    spotsLeft: 46,
  },
  {
    id: 'PO007',
    eventNumber: 7,
    name: 'Main Event Day 1A',
    status: 'upcoming',
    startTime: new Date('2025-08-24T15:00:00'),
    registrationClose: new Date('2025-08-25T21:00:00'),
    buyIn: '550€',
    structure: '100k/60min',
    registered: 234,
    maxPlayers: 500,
    spotsLeft: 266,
  },
  {
    id: 'PO008',
    eventNumber: 8,
    name: 'Side Event - Omaha Hi/Lo',
    status: 'upcoming',
    startTime: new Date('2025-08-24T19:00:00'),
    registrationClose: new Date('2025-08-24T22:00:00'),
    buyIn: '150€',
    structure: '30k/30min',
    registered: 45,
    maxPlayers: 80,
    spotsLeft: 35,
  },
  {
    id: 'PO009',
    eventNumber: 9,
    name: 'Main Event Day 1B',
    status: 'upcoming',
    startTime: new Date('2025-08-25T15:00:00'),
    registrationClose: new Date('2025-08-26T21:00:00'),
    buyIn: '550€',
    structure: '100k/60min',
    registered: 289,
    maxPlayers: 500,
    spotsLeft: 211,
  },
  {
    id: 'PO010',
    eventNumber: 10,
    name: 'High Roller',
    status: 'upcoming',
    startTime: new Date('2025-08-27T19:00:00'),
    registrationClose: new Date('2025-08-27T23:00:00'),
    buyIn: '1.000€',
    structure: '150k/45min',
    registered: 23,
    maxPlayers: 60,
    spotsLeft: 37,
  },
  {
    id: 'PO011',
    eventNumber: 11,
    name: 'Mystery Bounty',
    status: 'upcoming',
    startTime: new Date('2025-08-30T15:00:00'),
    registrationClose: new Date('2025-08-30T21:00:00'),
    buyIn: '550€',
    structure: '75k/40min',
    registered: 156,
    maxPlayers: 250,
    spotsLeft: 94,
  },
  {
    id: 'PO012',
    eventNumber: 12,
    name: 'Closing Event - Freezeout',
    status: 'upcoming',
    startTime: new Date('2025-08-31T19:00:00'),
    registrationClose: new Date('2025-08-31T22:00:00'),
    buyIn: '200€',
    structure: '40k/30min',
    registered: 67,
    maxPlayers: 120,
    spotsLeft: 53,
  }
])

// Computed properties
const filteredTournaments = computed(() => {
  let filtered = tournaments.value
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.eventNumber.toString().includes(query)
    )
  }
  
  return filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
})

// Group tournaments by date
const groupedTournaments = computed(() => {
  const groups: { [key: string]: any[] } = {}
  
  filteredTournaments.value.forEach(tournament => {
    const dateKey = tournament.startTime.toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(tournament)
  })
  
  return Object.keys(groups).map(dateKey => {
    const date = new Date(dateKey)
    const dateLabel = formatDateHeader(date)
    return {
      date: dateKey,
      dateLabel,
      tournaments: groups[dateKey],
      expanded: dateGroupsExpanded.value[dateKey] ?? true
    }
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

// Methods
const toggleDateGroup = (dateKey: string) => {
  dateGroupsExpanded.value[dateKey] = !dateGroupsExpanded.value[dateKey]
}


const getStatusCircleClass = (status: string) => {
  switch(status) {
    case 'upcoming': return 'pp-circle-upcoming'
    case 'live': return 'pp-circle-live'
    case 'completed': return 'pp-circle-completed'
    default: return 'pp-circle-default'
  }
}

const formatDateHeader = (date: Date) => {
  const day = date.getDate()
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' })
  return `${day} ${month} – ${weekday}`
}

const formatDateTime = (date: Date) => {
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateOnly = (dateKey: string) => {
  const date = new Date(dateKey)
  const day = date.getDate()
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  return `${day} ${month}`
}

const formatWeekday = (dateKey: string) => {
  const date = new Date(dateKey)
  return date.toLocaleDateString('en-GB', { weekday: 'long' })
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
  setTimeout(() => { (ev.target as any)?.complete?.() }, 1000)
}

const viewTournament = (tournament: any) => {
  // Navigate to tournament detail page
  console.log('View tournament:', tournament.id)
}

const registerTournament = (tournament: any) => {
  tournament.isRegistered = !tournament.isRegistered
  if (tournament.isRegistered) {
    tournament.registered++
    tournament.spotsLeft--
  } else {
    tournament.registered--
    tournament.spotsLeft++
  }
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

/* Event Info Section */
.pp-event-section {
  padding: 20px 16px;
  border-bottom: 1px solid #24242a;
}

.pp-event-title {
  color: #fee78a;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.pp-event-subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 16px 0;
}


/* Search Section */
.pp-search-section {
  padding: 16px;
  border-bottom: 1px solid #24242a;
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

/* Table Section */
.pp-table-section {
  padding: 0;
}

.pp-table-headers {
  display: grid;
  grid-template-columns: 80px 1fr 60px 100px;
  gap: 8px;
  padding: 12px 16px;
  background: #24242a;
  border-bottom: 1px solid #54545f;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Date Groups */
.pp-date-group {
  margin-bottom: 24px;
}

.pp-date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.pp-date-header:hover {
  border-bottom-color: #ef4444;
  background: linear-gradient(135deg, #2a2a30 0%, #1f1f24 100%);
}

.pp-date-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.pp-date-text {
  color: #ef4444;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.pp-date-subtitle {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.pp-expand-icon {
  color: #fee78a;
  font-size: 24px;
  transition: transform 0.3s ease;
}

.pp-date-header:hover .pp-expand-icon {
  transform: scale(1.1);
  color: #fbbf24;
}

/* Tournament Cards */
.pp-tournament-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.pp-tournament-card {
  background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pp-tournament-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #fee78a, #fbbf24);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pp-tournament-card:hover {
  border-color: #fee78a;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(254, 231, 138, 0.2);
}

.pp-tournament-card:hover::before {
  opacity: 1;
}

/* Card Components */
.pp-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.pp-card-left {
  flex: 1;
}

.pp-time-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(254, 231, 138, 0.1);
  border: 1px solid rgba(254, 231, 138, 0.3);
  border-radius: 12px;
  padding: 6px 12px;
  margin-bottom: 12px;
  width: fit-content;
}

.pp-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pp-circle-upcoming {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.pp-circle-live {
  background: #ef4444;
  animation: pulse-glow 2s ease-in-out infinite;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.7);
}

.pp-circle-completed {
  background: #64748b;
}

.pp-time {
  color: #fee78a;
  font-size: 13px;
  font-weight: 600;
}

.pp-tournament-title {
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

.pp-card-right {
  display: flex;
  align-items: center;
}

.pp-entries-badge {
  background: linear-gradient(135deg, #64748b, #475569);
  border-radius: 12px;
  padding: 8px 12px;
  text-align: center;
  min-width: 60px;
}

.pp-entries-number {
  display: block;
  color: white;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

.pp-entries-label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-card-details {
  margin-bottom: 16px;
}

.pp-detail-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pp-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(84, 84, 95, 0.2);
  border: 1px solid rgba(84, 84, 95, 0.4);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pp-chip ion-icon {
  font-size: 14px;
}

.pp-buyin-chip {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.pp-stack-chip {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.pp-seats-chip {
  background: rgba(251, 146, 60, 0.1);
  border-color: rgba(251, 146, 60, 0.3);
  color: #fb923c;
}

.pp-card-footer {
  border-top: 1px solid rgba(84, 84, 95, 0.2);
  padding-top: 12px;
}

.pp-registration-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.pp-clock-icon {
  color: #64748b;
  font-size: 14px;
}

.pp-reg-text {
  color: #94a3b8;
}

.pp-reg-time {
  color: #fee78a;
  font-weight: 600;
  margin-left: auto;
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

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive Design */
@media (max-width: 480px) {
  .pp-table-headers {
    grid-template-columns: 70px 1fr 50px 90px;
    font-size: 10px;
    padding: 10px 12px;
  }
  
  .pp-tournament-row {
    grid-template-columns: 70px 1fr 50px 90px;
    padding: 10px 12px;
  }
  
  .pp-event-title {
    font-size: 20px;
  }
}
</style>