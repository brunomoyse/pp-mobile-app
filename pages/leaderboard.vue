<template>
  <IonPage class="pp-page">
    <!-- Header -->
    <IonHeader :translucent="true" class="pp-header">
      <IonToolbar class="pp-toolbar">
        <IonTitle class="pp-title">{{ t('leaderboard.title') }}</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="showFilters = !showFilters" class="pp-header-button">
            <IonIcon :icon="optionsOutline" />
          </IonButton>
        </IonButtons>
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

      <!-- Current User Stats (only for authenticated users) -->
      <section v-if="isAuthenticated" class="pp-section">
        <div class="pp-current-player-card">
          <div class="pp-current-player-header">
            <div class="pp-current-player-info">
              <div class="pp-current-player-avatar">
                <IonAvatar class="pp-avatar">
                  <img :src="avatarUrl" alt="Your avatar" />
                </IonAvatar>
                <div class="pp-rank-badge">
                  <span class="pp-rank-number">#{{ currentPlayerRank }}</span>
                </div>
              </div>
              <div class="pp-current-player-details">
                <h3 class="pp-current-player-name">{{ currentPlayerName }}</h3>
                <p class="pp-current-player-subtitle">{{ t('leaderboard.yourRank') }}</p>
              </div>
            </div>
            <div class="pp-current-player-stats">
              <div class="pp-stat-item">
                <div class="pp-stat-value">{{ currentPlayerPoints }}</div>
                <div class="pp-stat-label">{{ t('leaderboard.points') }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Guest user prompt -->
      <section v-else class="pp-section">
        <div class="pp-guest-prompt-card">
          <div class="pp-guest-content">
            <IonIcon :icon="trophyOutline" class="pp-guest-icon" />
            <h3 class="pp-guest-title">{{ t('leaderboard.guestTitle') }}</h3>
            <p class="pp-guest-subtitle">{{ t('leaderboard.guestSubtitle') }}</p>
            <IonButton @click="goToLogin" class="pp-guest-button">
              {{ t('leaderboard.loginToCompete') }}
            </IonButton>
          </div>
        </div>
      </section>

      <!-- Time Period & Category Selection -->
      <section class="pp-section">
        <div class="pp-period-selector">
          <IonSegment v-model="selectedPeriod" @ionChange="onPeriodChange" class="pp-segment">
            <IonSegmentButton value="week" class="pp-segment-button">
              <IonLabel>{{ t('leaderboard.periods.week') }}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="month" class="pp-segment-button">
              <IonLabel>{{ t('leaderboard.periods.month') }}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="year" class="pp-segment-button">
              <IonLabel>{{ t('leaderboard.periods.year') }}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="allTime" class="pp-segment-button">
              <IonLabel>{{ t('leaderboard.periods.allTime') }}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        <div class="pp-category-selector">
          <IonSegment v-model="selectedCategory" @ionChange="onCategoryChange" class="pp-segment">
            <IonSegmentButton value="overall" class="pp-segment-button">
              <IonLabel>{{ t('leaderboard.categories.overall') }}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="profit" class="pp-segment-button">
              <IonLabel>{{ t('leaderboard.categories.profit') }}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="volume" class="pp-segment-button">
              <IonLabel>{{ t('leaderboard.categories.volume') }}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
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
            <IonLabel>{{ t(`leaderboard.filters.${filter.key}`) }}</IonLabel>
          </IonChip>
        </div>
      </section>

      <!-- Leaderboard List -->
      <section class="pp-section">
        <!-- Top 3 Podium -->
        <div class="pp-podium" v-if="topThreePlayers.length >= 3">
          <!-- Second Place -->
          <div class="pp-podium-position pp-podium-second">
            <div class="pp-podium-rank">2</div>
            <IonAvatar class="pp-podium-avatar">
              <img :src="topThreePlayers[1].avatar" :alt="topThreePlayers[1].name" />
            </IonAvatar>
            <div class="pp-podium-name">{{ topThreePlayers[1].name }}</div>
            <div class="pp-podium-points">{{ formatPoints(topThreePlayers[1].points) }}</div>
          </div>

          <!-- First Place -->
          <div class="pp-podium-position pp-podium-first">
            <div class="pp-podium-crown">👑</div>
            <div class="pp-podium-rank">1</div>
            <IonAvatar class="pp-podium-avatar">
              <img :src="topThreePlayers[0].avatar" :alt="topThreePlayers[0].name" />
            </IonAvatar>
            <div class="pp-podium-name">{{ topThreePlayers[0].name }}</div>
            <div class="pp-podium-points">{{ formatPoints(topThreePlayers[0].points) }}</div>
          </div>

          <!-- Third Place -->
          <div class="pp-podium-position pp-podium-third">
            <div class="pp-podium-rank">3</div>
            <IonAvatar class="pp-podium-avatar">
              <img :src="topThreePlayers[2].avatar" :alt="topThreePlayers[2].name" />
            </IonAvatar>
            <div class="pp-podium-name">{{ topThreePlayers[2].name }}</div>
            <div class="pp-podium-points">{{ formatPoints(topThreePlayers[2].points) }}</div>
          </div>
        </div>

        <!-- Rest of Leaderboard -->
        <div class="pp-leaderboard-list">
          <div 
            v-for="(player, index) in remainingPlayers" 
            :key="player.id" 
            class="pp-player-card"
            :class="{ 'pp-current-user': player.isCurrentUser }"
            @click="viewPlayerProfile(player)"
          >
            <div class="pp-player-rank">
              <span class="pp-rank-text">#{{ player.rank }}</span>
              <div class="pp-rank-change" v-if="player.rankChange !== 0">
                <IonIcon 
                  :icon="player.rankChange > 0 ? trendingUpOutline : trendingDownOutline"
                  :class="player.rankChange > 0 ? 'pp-rank-up' : 'pp-rank-down'"
                />
                <span :class="player.rankChange > 0 ? 'pp-rank-up' : 'pp-rank-down'">
                  {{ Math.abs(player.rankChange) }}
                </span>
              </div>
            </div>

            <div class="pp-player-info">
              <IonAvatar class="pp-player-avatar">
                <img :src="player.avatar" :alt="player.name" />
              </IonAvatar>
              <div class="pp-player-details">
                <h4 class="pp-player-name">
                  {{ player.name }}
                  <IonIcon v-if="player.isVerified" :icon="checkmarkCircleOutline" class="pp-verified-icon" />
                </h4>
                <div class="pp-player-stats">
                  <span class="pp-player-stat">{{ player.tournaments }} {{ t('leaderboard.tournaments') }}</span>
                  <span class="pp-player-separator">•</span>
                  <span class="pp-player-stat">{{ player.winRate }}% {{ t('leaderboard.itm') }}</span>
                  <span class="pp-player-separator">•</span>
                  <span class="pp-player-stat">{{ player.club }}</span>
                </div>
              </div>
            </div>

            <div class="pp-player-score">
              <div class="pp-score-main">{{ formatPoints(player.points) }}</div>
              <div class="pp-score-secondary">
                <span v-if="selectedCategory === 'profit'" class="pp-profit" :class="player.profit >= 0 ? 'pp-profit-positive' : 'pp-profit-negative'">
                  {{ player.profit >= 0 ? '+' : '' }}{{ player.profit.toLocaleString('fr-BE', { maximumFractionDigits: 0 }) }}€
                </span>
                <span v-else-if="selectedCategory === 'volume'">
                  {{ player.volume.toLocaleString('fr-BE', { maximumFractionDigits: 0 }) }}€
                </span>
                <span v-else>
                  {{ player.averageFinish }} {{ t('leaderboard.avgFinish') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="pp-load-more" v-if="hasMorePlayers">
          <IonButton @click="loadMorePlayers" fill="clear" class="pp-load-more-button">
            <IonIcon :icon="chevronDownOutline" />
            {{ t('leaderboard.loadMore') }}
          </IonButton>
        </div>

        <!-- Empty State -->
        <div v-if="filteredPlayers.length === 0" class="pp-empty-state">
          <IonIcon :icon="trophyOutline" class="pp-empty-icon" />
          <h3 class="pp-empty-title">{{ t('leaderboard.empty.title') }}</h3>
          <p class="pp-empty-text">{{ t('leaderboard.empty.subtitle') }}</p>
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
  IonChip,
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from '@ionic/vue'
import ClubSelector from '@/components/ClubSelector.vue'
import {
  optionsOutline,
  trendingUpOutline,
  trendingDownOutline,
  checkmarkCircleOutline,
  trophyOutline,
  chevronDownOutline,
} from 'ionicons/icons'
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import avatarUrl from '@/assets/images/jmvdb.png'

// Use custom i18n composable
const { t } = useI18n()

// Authentication state
const { isAuthenticated } = useAuth()

// Current user data
const currentPlayerName = 'Jean-Marie'
const currentPlayerRank = 7
const currentPlayerPoints = 1250

// Reactive data
const showFilters = ref(false)
const selectedPeriod = ref<'week' | 'month' | 'year' | 'allTime'>('month')
const selectedCategory = ref<'overall' | 'profit' | 'volume'>('overall')
const selectedFilters = ref<string[]>([])
const displayLimit = ref(20)
const hasMorePlayers = ref(true)

// Filter options
const filters = [
  { key: 'verified', label: 'Verified Players' },
  { key: 'club', label: 'Same Club' },
  { key: 'highVolume', label: 'High Volume' },
  { key: 'recent', label: 'Recently Active' },
]

// Mock leaderboard data
const allPlayers = ref([
  {
    id: 'p1',
    rank: 1,
    name: 'Alexandre D.',
    avatar: avatarUrl,
    points: 2840,
    profit: 12500,
    volume: 45000,
    tournaments: 28,
    winRate: 42,
    club: 'Pokah Room Antwerp',
    rankChange: 0,
    isVerified: true,
    isCurrentUser: false,
    averageFinish: 3.2
  },
  {
    id: 'p2',
    rank: 2,
    name: 'Sophie M.',
    avatar: avatarUrl,
    points: 2650,
    profit: 9800,
    volume: 38000,
    tournaments: 24,
    winRate: 38,
    club: 'Liège Poker Club',
    rankChange: 1,
    isVerified: true,
    isCurrentUser: false,
    averageFinish: 3.8
  },
  {
    id: 'p3',
    rank: 3,
    name: 'Thomas B.',
    avatar: avatarUrl,
    points: 2420,
    profit: 8200,
    volume: 32000,
    tournaments: 22,
    winRate: 35,
    club: 'Pokah Room Antwerp',
    rankChange: -1,
    isVerified: false,
    isCurrentUser: false,
    averageFinish: 4.1
  },
  {
    id: 'p4',
    rank: 4,
    name: 'Marie L.',
    avatar: avatarUrl,
    points: 2180,
    profit: 7600,
    volume: 29000,
    tournaments: 20,
    winRate: 40,
    club: 'Brussels Poker Club',
    rankChange: 2,
    isVerified: true,
    isCurrentUser: false,
    averageFinish: 3.5
  },
  {
    id: 'p5',
    rank: 5,
    name: 'Pierre V.',
    avatar: avatarUrl,
    points: 1980,
    profit: 6200,
    volume: 26500,
    tournaments: 19,
    winRate: 32,
    club: 'Liège Poker Club',
    rankChange: 0,
    isVerified: false,
    isCurrentUser: false,
    averageFinish: 4.8
  },
  {
    id: 'p6',
    rank: 6,
    name: 'Emma R.',
    avatar: avatarUrl,
    points: 1750,
    profit: 4800,
    volume: 23000,
    tournaments: 17,
    winRate: 35,
    club: 'Pokah Room Antwerp',
    rankChange: -2,
    isVerified: true,
    isCurrentUser: false,
    averageFinish: 4.2
  },
  {
    id: 'p7',
    rank: 7,
    name: 'Jean-Marie',
    avatar: avatarUrl,
    points: 1250,
    profit: 2700,
    volume: 18500,
    tournaments: 14,
    winRate: 34,
    club: 'Pokah Room Antwerp',
    rankChange: 1,
    isVerified: false,
    isCurrentUser: true,
    averageFinish: 4.5
  },
  {
    id: 'p8',
    rank: 8,
    name: 'Lucas G.',
    avatar: avatarUrl,
    points: 1180,
    profit: 2200,
    volume: 16800,
    tournaments: 13,
    winRate: 31,
    club: 'Brussels Poker Club',
    rankChange: -1,
    isVerified: false,
    isCurrentUser: false,
    averageFinish: 5.1
  }
])

// Available clubs for filtering
const availableClubs = ref([
  'All Clubs',
  'Pokah Room Antwerp',
  'Liège Poker Club', 
  'Brussels Poker Club'
])
const selectedClub = ref('All Clubs')

// Computed properties
const filteredPlayers = computed(() => {
  let filtered = [...allPlayers.value]
  
  // Apply filters
  if (selectedFilters.value.length > 0) {
    filtered = filtered.filter(player => {
      return selectedFilters.value.some(filter => {
        switch(filter) {
          case 'verified':
            return player.isVerified
          case 'club':
            return player.club === 'Pokah Room Antwerp' // Current user's club
          case 'highVolume':
            return player.volume > 25000
          case 'recent':
            return player.tournaments >= 15
          default:
            return true
        }
      })
    })
  }

  return filtered
})

const topThreePlayers = computed(() => {
  return filteredPlayers.value.slice(0, 3)
})

const remainingPlayers = computed(() => {
  return filteredPlayers.value.slice(3, displayLimit.value)
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

const onPeriodChange = (e: CustomEvent) => {
  selectedPeriod.value = e.detail.value
  // Here you would typically fetch new data based on the period
}

const onCategoryChange = (e: CustomEvent) => {
  selectedCategory.value = e.detail.value
  // Here you would typically re-sort data based on category
}

const formatPoints = (points: number) => {
  return points.toLocaleString()
}

const loadMorePlayers = () => {
  displayLimit.value += 10
  if (displayLimit.value >= filteredPlayers.value.length) {
    hasMorePlayers.value = false
  }
}

const handleRefresh = async (ev: CustomEvent) => {
  // Simulate data refresh
  setTimeout(() => { (ev.target as any)?.complete?.() }, 1000)
}

const goToLogin = () => {
  navigateTo('/login')
}

const viewPlayerProfile = (player: any) => {
  console.log('View player profile:', player.id)
  // Navigate to player profile page
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

/* Current Player Card */
.pp-current-player-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 2px solid #fee78a;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 8px;
  box-shadow: 0 4px 16px rgba(254, 231, 138, 0.2);
}

.pp-current-player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pp-current-player-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pp-current-player-avatar {
  position: relative;
}

.pp-avatar {
  width: 60px;
  height: 60px;
  border: 2px solid #fee78a;
}

.pp-rank-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: linear-gradient(135deg, #64748b, #475569);
  border-radius: 12px;
  padding: 2px 8px;
  border: 2px solid #fee78a;
}

.pp-rank-number {
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.pp-current-player-name {
  color: #fee78a;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.pp-current-player-subtitle {
  color: #94a3b8;
  font-size: 12px;
  margin: 0;
}

.pp-current-player-stats .pp-stat-item {
  text-align: right;
}

.pp-stat-value {
  color: #fee78a;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 2px;
}

.pp-stat-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Guest Prompt Card */
.pp-guest-prompt-card {
  background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  margin: 0 16px 16px 16px;
  overflow: hidden;
}

.pp-guest-content {
  text-align: center;
  padding: 32px 24px;
}

.pp-guest-icon {
  font-size: 48px;
  color: #64748b;
  margin-bottom: 16px;
}

.pp-guest-title {
  color: #e2e8f0;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.pp-guest-subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.4;
}

.pp-guest-button {
  --background: linear-gradient(135deg, #fee78a, #fbbf24);
  --color: #18181a;
  --border-radius: 12px;
  height: 44px;
  font-weight: 600;
  font-size: 14px;
}

/* Segments */
.pp-period-selector, .pp-category-selector {
  margin-bottom: 12px;
}

.pp-segment {
  --background: rgba(84, 84, 95, 0.1);
  border-radius: 8px;
}

.pp-segment-button {
  --color: #54545f;
  --color-checked: #18181a;
  --background-checked: #fee78a;
  font-size: 12px;
  font-weight: 500;
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

/* Podium */
.pp-podium {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 8px;
  margin-bottom: 24px;
  padding: 0 8px;
}

.pp-podium-position {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 16px 12px;
  position: relative;
  flex: 1;
}

.pp-podium-first {
  transform: translateY(-12px);
  border-color: #fee78a;
  box-shadow: 0 8px 24px rgba(254, 231, 138, 0.3);
}

.pp-podium-second {
  transform: translateY(-4px);
  border-color: #94a3b8;
}

.pp-podium-third {
  border-color: #64748b;
}

.pp-podium-crown {
  font-size: 24px;
  margin-bottom: 4px;
}

.pp-podium-rank {
  background: linear-gradient(135deg, #64748b, #475569);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
}

.pp-podium-first .pp-podium-rank {
  background: linear-gradient(135deg, #fee78a, #fbbf24);
  color: #18181a;
}

.pp-podium-avatar {
  width: 50px;
  height: 50px;
  margin-bottom: 8px;
  border: 2px solid rgba(254, 231, 138, 0.3);
}

.pp-podium-first .pp-podium-avatar {
  border-color: #fee78a;
}

.pp-podium-name {
  color: #fee78a;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 4px;
}

.pp-podium-points {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

/* Leaderboard List */
.pp-leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pp-player-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pp-player-card:hover {
  border-color: #64748b;
  transform: translateY(-1px);
}

.pp-current-user {
  border-color: #fee78a;
  background: linear-gradient(135deg, rgba(254, 231, 138, 0.1), rgba(24, 24, 26, 0.95));
}

.pp-player-rank {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
}

.pp-rank-text {
  color: #fee78a;
  font-size: 16px;
  font-weight: 700;
}

.pp-rank-change {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 2px;
}

.pp-rank-up {
  color: #22c55e;
  font-size: 10px;
  font-weight: 600;
}

.pp-rank-down {
  color: #ef4444;
  font-size: 10px;
  font-weight: 600;
}

.pp-player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.pp-player-avatar {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(100, 116, 139, 0.3);
}

.pp-player-name {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pp-verified-icon {
  color: #22c55e;
  font-size: 16px;
}

.pp-player-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pp-player-stat {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 400;
}

.pp-player-separator {
  color: #54545f;
  font-size: 11px;
}

.pp-player-score {
  text-align: right;
  min-width: 80px;
}

.pp-score-main {
  color: #fee78a;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 2px;
}

.pp-score-secondary {
  font-size: 11px;
  font-weight: 500;
}

.pp-profit-positive {
  color: #22c55e;
}

.pp-profit-negative {
  color: #ef4444;
}

/* Load More */
.pp-load-more {
  text-align: center;
  margin-top: 24px;
}

.pp-load-more-button {
  --color: #64748b;
  --color-hover: #fee78a;
  font-size: 14px;
  font-weight: 500;
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