<template>
  <IonPage class="pp-page">
    <!-- Header -->
    <IonHeader :translucent="true" class="pp-header">
      <IonToolbar class="pp-toolbar">
        <IonButtons slot="start">
          <IonButton @click="goBack" class="pp-header-button">
            <IonIcon :icon="arrowBackOutline" />
          </IonButton>
        </IonButtons>
        <IonTitle class="pp-title">Tournament History</IonTitle>
      </IonToolbar>
      <IonToolbar class="pp-sub-toolbar">
        <ClubSelector v-model="selectedClub" />
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true" class="pp-content">
      <!-- Pull to refresh -->
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent :pulling-text="t('common.pullToRefresh')" refreshing-spinner="dots" />
      </IonRefresher>

      <!-- Stats Summary -->
      <section class="pp-section">
        <div class="pp-stats-summary">
          <div class="pp-summary-card">
            <div class="pp-summary-value">{{ historyStats.totalTournaments }}</div>
            <div class="pp-summary-label">Total Played</div>
          </div>
          <div class="pp-summary-card">
            <div class="pp-summary-value">{{ historyStats.totalWins }}</div>
            <div class="pp-summary-label">Wins</div>
          </div>
          <div class="pp-summary-card">
            <div class="pp-summary-value">{{ formatCurrency(historyStats.totalWinnings) }}</div>
            <div class="pp-summary-label">Total Winnings</div>
          </div>
          <div class="pp-summary-card">
            <div class="pp-summary-value">{{ historyStats.winRate }}%</div>
            <div class="pp-summary-label">ITM Rate</div>
          </div>
        </div>
      </section>

      <!-- Tournament History List -->
      <section class="pp-section">
        <div class="pp-tournament-list" v-if="tournamentHistory.length > 0">
          <div 
            v-for="tournament in tournamentHistory" 
            :key="tournament.id"
            class="pp-tournament-card"
            @click="viewTournament(tournament.id)"
          >
            <div class="pp-tournament-header">
              <div class="pp-tournament-info">
                <h3 class="pp-tournament-name">{{ tournament.name }}</h3>
                <div class="pp-tournament-details">
                  <span class="pp-tournament-date">{{ formatDate(tournament.date) }}</span>
                  <span class="pp-tournament-separator">•</span>
                  <span class="pp-tournament-buyin">{{ formatCurrency(tournament.buyIn) }}</span>
                </div>
              </div>
              <div class="pp-tournament-position" :class="getPositionClass(tournament.position, tournament.totalPlayers)">
                <div class="pp-position-rank">{{ tournament.position }}</div>
                <div class="pp-position-total">/{{ tournament.totalPlayers }}</div>
              </div>
            </div>
            
            <div class="pp-tournament-results">
              <div class="pp-result-item">
                <span class="pp-result-label">Winnings</span>
                <span class="pp-result-value" :class="tournament.winnings > 0 ? 'pp-positive' : ''">
                  {{ formatCurrency(tournament.winnings) }}
                </span>
              </div>
              <div class="pp-result-item" v-if="tournament.roi !== undefined">
                <span class="pp-result-label">ROI</span>
                <span class="pp-result-value" :class="tournament.roi > 0 ? 'pp-positive' : tournament.roi < 0 ? 'pp-negative' : ''">
                  {{ tournament.roi > 0 ? '+' : '' }}{{ tournament.roi }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="pp-empty-state">
          <IonIcon :icon="trophyOutline" class="pp-empty-icon" />
          <h3 class="pp-empty-title">No Tournament History</h3>
          <p class="pp-empty-description">Start playing tournaments to see your history here</p>
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
} from '@ionic/vue'
import ClubSelector from '@/components/ClubSelector.vue'
import {
  arrowBackOutline,
  trophyOutline,
} from 'ionicons/icons'
import { ref } from 'vue'

definePageMeta({
    middleware: 'auth'
})

// Use custom i18n composable
const { t } = useI18n()

// Club selector
const selectedClub = ref(null)

// Tournament history data
const historyStats = ref({
  totalTournaments: 156,
  totalWins: 47,
  totalWinnings: 12850,
  winRate: 34,
})

const tournamentHistory = ref([
  {
    id: 1,
    name: 'Sunday Million Qualifier',
    date: new Date('2024-01-15'),
    buyIn: 25,
    position: 1,
    totalPlayers: 124,
    winnings: 850,
    roi: 3300,
  },
  {
    id: 2,
    name: 'Friday Night Deep Stack',
    date: new Date('2024-01-12'),
    buyIn: 50,
    position: 8,
    totalPlayers: 89,
    winnings: 125,
    roi: 150,
  },
  {
    id: 3,
    name: 'Mid-Week Turbo',
    date: new Date('2024-01-10'),
    buyIn: 15,
    position: 23,
    totalPlayers: 67,
    winnings: 0,
    roi: -100,
  },
  {
    id: 4,
    name: 'Weekend Warrior',
    date: new Date('2024-01-07'),
    buyIn: 75,
    position: 4,
    totalPlayers: 156,
    winnings: 450,
    roi: 500,
  },
  {
    id: 5,
    name: 'Daily Grind',
    date: new Date('2024-01-05'),
    buyIn: 10,
    position: 15,
    totalPlayers: 45,
    winnings: 25,
    roi: 150,
  },
])

// Methods
const handleRefresh = async (ev: CustomEvent) => {
  setTimeout(() => { (ev.target as any)?.complete?.() }, 1000)
}

const goBack = () => {
  history.back()
}

const viewTournament = (tournamentId: number) => {
  navigateTo(`/tournament/${tournamentId}`)
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString('fr-BE', { maximumFractionDigits: 0 })}€`
}

const getPositionClass = (position: number, total: number) => {
  const percentage = (position / total) * 100
  if (position === 1) return 'pp-position-first'
  if (percentage <= 10) return 'pp-position-top'
  if (percentage <= 20) return 'pp-position-itm'
  return 'pp-position-out'
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

.pp-section {
  padding: 16px;
}

/* Stats Summary */
.pp-stats-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.pp-summary-card {
  background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.pp-summary-card:hover {
  border-color: #fee78a;
  transform: translateY(-2px);
}

.pp-summary-value {
  color: #fee78a;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.pp-summary-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

/* Tournament List */
.pp-tournament-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pp-tournament-card {
  background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pp-tournament-card:hover {
  border-color: #fee78a;
  transform: translateY(-2px);
}

.pp-tournament-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.pp-tournament-info {
  flex: 1;
}

.pp-tournament-name {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.pp-tournament-details {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
}

.pp-tournament-separator {
  color: #54545f;
}

.pp-tournament-position {
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 700;
}

.pp-position-first {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #18181a;
}

.pp-position-top {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.pp-position-itm {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.pp-position-out {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.pp-position-rank {
  font-size: 16px;
  line-height: 1;
}

.pp-position-total {
  font-size: 12px;
  opacity: 0.8;
}

/* Tournament Results */
.pp-tournament-results {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #24242a;
}

.pp-result-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pp-result-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-result-value {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}

.pp-positive {
  color: #22c55e;
}

.pp-negative {
  color: #ef4444;
}

/* Empty State */
.pp-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.pp-empty-icon {
  font-size: 64px;
  color: #54545f;
  margin-bottom: 16px;
}

.pp-empty-title {
  color: #e2e8f0;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.pp-empty-description {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
  max-width: 280px;
}

/* Responsive Design */
@media (max-width: 480px) {
  .pp-stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pp-tournament-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .pp-tournament-position {
    align-self: flex-start;
  }
  
  .pp-summary-value {
    font-size: 18px;
  }
}
</style>