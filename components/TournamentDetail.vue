<template>
  <div class="pp-tournament-detail">
    <!-- Pull to refresh -->
    <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
      <IonRefresherContent :pulling-text="t('common.pullToRefresh')" refreshing-spinner="dots" />
    </IonRefresher>

      <div v-if="tournament && !tournamentLoading">
        <!-- Tournament Header Info -->
        <section class="pp-section">
          <div class="pp-tournament-header-card">
            <div class="pp-tournament-title-section">
              <h1 class="pp-tournament-name">{{ tournament.name }}</h1>
              <div class="pp-tournament-meta">
                <IonBadge 
                  :class="getStatusClass(tournament.status)"
                  class="pp-status-badge"
                >
                  {{ tournament.liveStatus ? t(`events.status.${tournament.liveStatus.toLowerCase()}`) : t(`events.status.${tournament.status.toLowerCase()}`) }}
                </IonBadge>
                <IonChip class="pp-tournament-type" :class="`pp-type-${tournament.type}`">
                  <IonLabel>{{ t(`events.types.${tournament.type}`) }}</IonLabel>
                </IonChip>
              </div>
            </div>
          </div>

          <!-- Key Tournament Info -->
          <div class="pp-key-info-grid">
            <div class="pp-info-card">
              <IonIcon :icon="calendarOutline" class="pp-info-icon" />
              <div class="pp-info-content">
                <div class="pp-info-label">{{ t('events.dateTime') }}</div>
                <div class="pp-info-value">{{ formatDateTime(tournament.startTime) }}</div>
              </div>
            </div>
            
            <div class="pp-info-card">
              <IonIcon :icon="cashOutline" class="pp-info-icon" />
              <div class="pp-info-content">
                <div class="pp-info-label">{{ t('events.buyIn') }}</div>
                <div class="pp-info-value">{{ tournament.buyIn }}</div>
              </div>
            </div>
            
            <div class="pp-info-card">
              <IonIcon :icon="layersOutline" class="pp-info-icon" />
              <div class="pp-info-content">
                <div class="pp-info-label">{{ t('events.structure') }}</div>
                <div class="pp-info-value">{{ tournament.structure }}</div>
              </div>
            </div>
            
            <div class="pp-info-card">
              <IonIcon :icon="peopleOutline" class="pp-info-icon" />
              <div class="pp-info-content">
                <div class="pp-info-label">{{ t('events.players') }}</div>
                <div class="pp-info-value">
                  {{ tournament.maxPlayers }}/{{ tournament.registered }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Status-Specific Content -->
        
        <!-- UPCOMING Tournament -->
        <section v-if="tournament.status === 'UPCOMING'" class="pp-section">
          <!-- Registration Status -->
          <div class="pp-registration-card">
            <div class="pp-registration-header">
              <h3 class="pp-section-title">{{ t('events.registration') }}</h3>
              <div class="pp-registration-status">
                <span v-if="tournament.spotsLeft > 0" class="pp-spots-available">
                  {{ t('events.spotsLeft', { count: tournament.spotsLeft }) }}
                </span>
                <span v-else class="pp-spots-full">{{ t('events.full') }}</span>
              </div>
            </div>
            
            <div class="pp-registration-actions">
              <IonButton 
                v-if="!tournament.isRegistered && tournament.spotsLeft > 0"
                @click="registerForTournament"
                class="pp-button-primary pp-register-btn"
                expand="block"
              >
                <IonIcon :icon="addOutline" slot="start" />
                {{ t('events.register') }} {{ tournament.buyIn }}
              </IonButton>
              
              <IonButton 
                v-else-if="tournament.isRegistered"
                @click="unregisterFromTournament"
                class="pp-button-warning pp-register-btn"
                expand="block"
              >
                <IonIcon :icon="removeOutline" slot="start" />
                {{ t('events.unregister') }}
              </IonButton>
              
              <IonButton 
                v-else
                class="pp-button-disabled pp-register-btn"
                expand="block"
                disabled
              >
                {{ t('events.full') }}
              </IonButton>
            </div>
            
            <div class="pp-registration-deadline">
              <IonIcon :icon="timeOutline" />
              <span>{{ t('events.registrationCloses') }} {{ formatDateTime(tournament.registrationClose) }}</span>
            </div>
          </div>

          <!-- Blinds Structure -->
          <div class="pp-blinds-card">
            <h3 class="pp-section-title">
              <IonIcon :icon="timerOutline" />
              {{ t('events.blindsStructure') }}
            </h3>
            <div class="pp-blinds-table">
              <div class="pp-blinds-header">
                <span>{{ t('events.level') }}</span>
                <span>{{ t('events.smallBlind') }}</span>
                <span>{{ t('events.bigBlind') }}</span>
                <span>{{ t('events.ante') }}</span>
                <span>{{ t('events.duration') }}</span>
              </div>
              <div v-for="level in blindsStructure" :key="level.level" class="pp-blinds-row">
                <span class="pp-level">{{ level.level }}</span>
                <span class="pp-sb">{{ level.smallBlind }}</span>
                <span class="pp-bb">{{ level.bigBlind }}</span>
                <span class="pp-ante">{{ level.ante || '-' }}</span>
                <span class="pp-duration">{{ t('events.minutes', { count: level.duration }) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- IN_PROGRESS Tournament -->
        <section v-if="tournament.status === 'IN_PROGRESS'" class="pp-section">
          <!-- Live Clock -->
          <div class="pp-live-clock-card">
            <div class="pp-clock-header">
              <h3 class="pp-section-title">
                <div class="pp-live-indicator"></div>
                {{ t('events.tournamentClock') }}
              </h3>
              <div class="pp-current-level">{{ t('events.level') }} {{ currentLevel.level }}</div>
            </div>
            
            <div class="pp-clock-display">
              <div class="pp-time-remaining">
                <div class="pp-time-value">{{ formatTimeRemaining(timeRemaining) }}</div>
                <div class="pp-time-label">
                  {{ currentLevel.isBreak ? t('events.breakTime') : t('events.timeRemaining') }}
                </div>
              </div>
              
              <div class="pp-current-blinds" v-if="!currentLevel.isBreak">
                <div class="pp-blinds-current">
                  <span class="pp-sb-current">{{ currentLevel.smallBlind }}</span>
                  <span class="pp-blinds-separator">/</span>
                  <span class="pp-bb-current">{{ currentLevel.bigBlind }}</span>
                </div>
                <div class="pp-blinds-label">{{ t('events.smallBigBlind') }}</div>
                <div v-if="currentLevel.ante" class="pp-ante-current">
                  {{ t('events.ante') }}: {{ currentLevel.ante }}
                </div>
              </div>
              
              <div class="pp-break-info" v-else>
                <div class="pp-break-text">{{ t('events.onBreak') }}</div>
                <div class="pp-break-label" v-if="!nextLevel.isBreak">
                  {{ t('events.nextLevel') }}: {{ nextLevel.smallBlind }}/{{ nextLevel.bigBlind }}
                </div>
                <div class="pp-break-label" v-else>
                  {{ t('events.nextLevel') }}: {{ t('events.break') }}
                </div>
              </div>
            </div>
            
            <div class="pp-next-level">
              <span class="pp-next-label">{{ t('events.nextLevel') }}:</span>
              <span v-if="nextLevel.isBreak" class="pp-next-break">{{ t('events.break') }}</span>
              <span v-else class="pp-next-blinds">{{ nextLevel.smallBlind }}/{{ nextLevel.bigBlind }}</span>
              <span v-if="nextLevel.ante && !nextLevel.isBreak" class="pp-next-ante">{{ t('events.ante') }}: {{ nextLevel.ante }}</span>
            </div>
          </div>

          <!-- Blinds Structure -->
          <div class="pp-blinds-card">
            <h3 class="pp-section-title">
              <IonIcon :icon="timerOutline" />
              {{ t('events.blindsStructure') }}
            </h3>
            <div class="pp-blinds-table">
              <div class="pp-blinds-header">
                <span>{{ t('events.level') }}</span>
                <span>{{ t('events.smallBlind') }}</span>
                <span>{{ t('events.bigBlind') }}</span>
                <span>{{ t('events.ante') }}</span>
                <span>{{ t('events.duration') }}</span>
              </div>
              <div v-for="level in blindsStructure" :key="level.level" class="pp-blinds-row">
                <span class="pp-level">{{ level.level }}</span>
                <span class="pp-sb">{{ level.smallBlind }}</span>
                <span class="pp-bb">{{ level.bigBlind }}</span>
                <span class="pp-ante">{{ level.ante || '-' }}</span>
                <span class="pp-duration">{{ t('events.minutes', { count: level.duration }) }}</span>
              </div>
            </div>
          </div>

          <!-- Table Assignment Quick View -->
          <div class="pp-seating-card">
            <div class="pp-seating-header">
              <h3 class="pp-section-title">
                <IonIcon :icon="gridOutline" />
                {{ t('events.tableAssignment') }}
              </h3>
              <IonButton 
                @click="viewFullSeatingChart"
                fill="clear"
                size="small"
                class="pp-view-all-btn"
              >
                {{ t('events.viewAllTables') }}
                <IonIcon :icon="chevronForwardOutline" slot="end" />
              </IonButton>
            </div>
            
            <div v-if="userSeat" class="pp-user-seat">
              <div class="pp-seat-info">
                <IonIcon :icon="personOutline" class="pp-seat-icon" />
                <div class="pp-seat-details">
                  <div class="pp-seat-table">{{ t('events.table') }} {{ userSeat.table }}</div>
                  <div class="pp-seat-position">{{ t('events.seat') }} {{ userSeat.seat }}</div>
                </div>
              </div>
              <div class="pp-seat-stack">
                <div class="pp-stack-value">{{ formatChips(userSeat.chips) }}</div>
                <div class="pp-stack-label">{{ t('events.chipStack') }}</div>
              </div>
            </div>
            
            <div class="pp-tables-summary">
              <div class="pp-tables-grid">
                <div v-for="table in tablesData.slice(0, 6)" :key="table.id" class="pp-table-mini">
                  <div class="pp-table-number">{{ table.number }}</div>
                  <div class="pp-table-players">{{ table.activePlayers }}/{{ table.maxPlayers }}</div>
                </div>
              </div>
              <div v-if="tablesData.length > 6" class="pp-more-tables">
                {{ t('events.moreTables', { count: tablesData.length - 6 }) }}
              </div>
            </div>
          </div>

          <!-- Live Stats -->
          <div class="pp-live-stats">
            <div class="pp-stat-item">
              <div class="pp-stat-value">{{ liveStats.playersRemaining }}</div>
              <div class="pp-stat-label">{{ t('events.stillInPlay') }}</div>
            </div>
            <div class="pp-stat-item">
              <div class="pp-stat-value">{{ formatChips(liveStats.averageStack) }}</div>
              <div class="pp-stat-label">{{ t('events.averageStack') }}</div>
            </div>
            <div class="pp-stat-item">
              <div class="pp-stat-value">{{ formatChips(liveStats.totalPrizePool) }}</div>
              <div class="pp-stat-label">{{ t('events.prizePool') }}</div>
            </div>
          </div>
        </section>

        <!-- COMPLETED Tournament -->
        <section v-if="tournament.status === 'COMPLETED'" class="pp-section">
          <!-- Final Results Summary -->
          <div class="pp-results-summary">
            <h3 class="pp-section-title">
              <IonIcon :icon="trophyOutline" />
              {{ t('events.finalResults') }}
            </h3>
            
            <div class="pp-tournament-complete-info">
              <div class="pp-complete-stat">
                <span class="pp-complete-label">{{ t('events.completed') }}:</span>
                <span class="pp-complete-value">{{ formatDateTime(tournament.endTime) }}</span>
              </div>
              <div class="pp-complete-stat">
                <span class="pp-complete-label">{{ t('events.duration') }}:</span>
                <span class="pp-complete-value">{{ formatDuration(tournament.duration) }}</span>
              </div>
              <div class="pp-complete-stat">
                <span class="pp-complete-label">{{ t('events.totalPlayers') }}:</span>
                <span class="pp-complete-value">{{ tournament.totalPlayers }}</span>
              </div>
            </div>
          </div>

          <!-- Podium (Top 3) -->
          <div class="pp-podium-section">
            <div class="pp-podium">
              <!-- Second Place -->
              <div class="pp-podium-position pp-podium-second">
                <div class="pp-podium-rank">2</div>
                <IonAvatar class="pp-podium-avatar">
                  <img :src="finalResults[1]?.avatar || '/assets/images/default-avatar.png'" @error="handleAvatarError" />
                </IonAvatar>
                <div class="pp-podium-name">{{ finalResults[1]?.name }}</div>
                <div class="pp-podium-payout">{{ finalResults[1]?.payout }}</div>
              </div>

              <!-- First Place -->
              <div class="pp-podium-position pp-podium-first">
                <div class="pp-podium-crown">👑</div>
                <div class="pp-podium-rank">1</div>
                <IonAvatar class="pp-podium-avatar">
                  <img :src="finalResults[0]?.avatar || '/assets/images/default-avatar.png'" @error="handleAvatarError" />
                </IonAvatar>
                <div class="pp-podium-name">{{ finalResults[0]?.name }}</div>
                <div class="pp-podium-payout">{{ finalResults[0]?.payout }}</div>
              </div>

              <!-- Third Place -->
              <div class="pp-podium-position pp-podium-third">
                <div class="pp-podium-rank">3</div>
                <IonAvatar class="pp-podium-avatar">
                  <img :src="finalResults[2]?.avatar || '/assets/images/default-avatar.png'" @error="handleAvatarError" />
                </IonAvatar>
                <div class="pp-podium-name">{{ finalResults[2]?.name }}</div>
                <div class="pp-podium-payout">{{ finalResults[2]?.payout }}</div>
              </div>
            </div>
          </div>

          <!-- User's Result (if participated) -->
          <div v-if="userResult" class="pp-user-result">
            <div class="pp-user-result-header">
              <h4 class="pp-user-result-title">{{ t('events.yourResult') }}</h4>
              <div class="pp-user-position" :class="userResult.position <= 3 ? 'pp-position-top' : ''">
                #{{ userResult.position }}
              </div>
            </div>
            <div class="pp-user-result-details">
              <div class="pp-result-detail">
                <span class="pp-result-label">{{ t('events.payout') }}:</span>
                <span class="pp-result-value" :class="userResult.payout > 0 ? 'pp-profit' : 'pp-loss'">
                  {{ userResult.payout > 0 ? userResult.payout : t('events.noPayout') }}
                </span>
              </div>
              <div class="pp-result-detail">
                <span class="pp-result-label">{{ t('events.netProfit') }}:</span>
                <span class="pp-result-value" :class="userResult.profit >= 0 ? 'pp-profit' : 'pp-loss'">
                  {{ userResult.profit >= 0 ? '+' : '' }}{{ userResult.profit }}€
                </span>
              </div>
            </div>
          </div>

          <!-- Full Results Table -->
          <div class="pp-full-results">
            <div class="pp-results-header">
              <h4 class="pp-results-title">{{ t('events.completeResults') }}</h4>
              <IonButton 
                @click="showAllResults = !showAllResults"
                fill="clear"
                size="small"
                class="pp-toggle-results"
              >
                {{ showAllResults ? t('events.showLess') : t('events.showAll') }}
                <IonIcon :icon="showAllResults ? chevronUpOutline : chevronDownOutline" slot="end" />
              </IonButton>
            </div>
            
            <div v-if="showAllResults" class="pp-results-table">
              <div class="pp-results-table-header">
                <span>{{ t('events.position') }}</span>
                <span>{{ t('events.player') }}</span>
                <span>{{ t('events.payout') }}</span>
              </div>
              <div 
                v-for="result in finalResults.slice(3, showAllResults ? finalResults.length : 10)" 
                :key="result.position"
                class="pp-results-row"
                :class="{ 'pp-user-row': result.isUser }"
              >
                <span class="pp-position">#{{ result.position }}</span>
                <span class="pp-player-name">
                  {{ result.name }}
                  <IonIcon v-if="result.isUser" :icon="personOutline" class="pp-user-icon" />
                </span>
                <span class="pp-payout">{{ result.payout || '-' }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Loading State -->
      <div v-else-if="tournamentLoading" class="pp-loading-state">
        <IonSpinner name="dots" />
        <p>{{ t('events.loadingDetails') }}</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="tournamentError" class="pp-error-state">
        <IonIcon :icon="alertCircleOutline" class="pp-error-icon" />
        <h3 class="pp-error-title">Error loading tournament</h3>
        <p class="pp-error-text">Please try again later</p>
        <IonButton @click="refetchTournament" class="pp-retry-button">
          Retry
        </IonButton>
      </div>
      
      <!-- No Tournament Found -->
      <div v-else class="pp-error-state">
        <IonIcon :icon="alertCircleOutline" class="pp-error-icon" />
        <h3 class="pp-error-title">Tournament not found</h3>
        <p class="pp-error-text">The tournament you're looking for doesn't exist</p>
      </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonRefresher,
  IonRefresherContent,
  IonChip,
  IonLabel,
  IonBadge,
  IonAvatar,
  IonSpinner,
  IonIcon,
} from '@ionic/vue'
import {
  arrowBackOutline,
  shareOutline,
  calendarOutline,
  cashOutline,
  layersOutline,
  peopleOutline,
  timeOutline,
  timerOutline,
  addOutline,
  removeOutline,
  gridOutline,
  chevronForwardOutline,
  chevronUpOutline,
  chevronDownOutline,
  trophyOutline,
  personOutline,
  alertCircleOutline,
} from 'ionicons/icons'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTournament, useTournamentClock, useTournamentClockQuery } from '~/composables/usePokerAPI'
import { usePlayerAvatar } from '~/composables/usePlayerAvatar'

// Props
interface Props {
  tournamentId: string
}
const props = defineProps<Props>()

// Use custom i18n composable
const { t, locale } = useI18n()

// Player avatar helper
const { getPlayerAvatarWithFallback } = usePlayerAvatar()

// Reactive data
const showAllResults = ref(false)
const currentTime = ref(new Date())
const timer = ref<NodeJS.Timeout | null>(null)

// Fetch tournament data from API
const { data: tournamentData, loading: tournamentLoading, error: tournamentError, refetch: refetchTournament } = useTournament(props.tournamentId)

// Fetch tournament clock data separately
const { data: clockQueryData, loading: clockLoading, error: clockQueryError, refetch: refetchClock } = useTournamentClockQuery(props.tournamentId)

// Subscribe to tournament clock updates
const { 
  data: clockData, 
  connected: clockConnected, 
  error: clockError,
  sendConnectionInit: debugSendInit
} = useTournamentClock(props.tournamentId)

// Transform API data to component format
const tournament = computed(() => {
  if (!tournamentData.value?.tournament) return null
  
  const data = tournamentData.value.tournament
  const totalRegistered = data.registrations?.length || 0
  
  // Debug logging to see what we're getting
  console.log('📊 Tournament data debug:', {
    title: data.title,
    totalRegistered,
    clock: data.clock,
    clockTimeRemaining: data.clock?.timeRemainingSeconds,
    clockStatus: data.clock?.status,
    clockCurrentLevel: data.clock?.currentLevel
  })
  
  return {
    id: data.id,
    name: data.title,
    title: data.title,
    description: data.description,
    type: 'deepstack', // Mock type for now
    status: data.status || 'UPCOMING', // Use status ENUM from API
    liveStatus: data.liveStatus, // Keep liveStatus for detailed status display
    club: 'Poker Club', // Mock club name since it's not in the new structure
    clubId: data.id, // Mock club ID
    city: 'City', // Mock city
    startTime: new Date(data.startTime),
    endTime: data.endTime ? new Date(data.endTime) : null,
    registrationClose: new Date(data.startTime), // Mock registration close
    buyIn: `${data.buyInCents / 100}€`,
    buyInCents: data.buyInCents,
    structure: '20k/20min', // Mock structure
    registered: totalRegistered,
    maxPlayers: data.seatCap || 100, // Use seatCap from GraphQL or fallback to 100
    spotsLeft: Math.max(0, (data.seatCap || 100) - totalRegistered),
    guarantee: `${Math.floor(data.buyInCents * 100 * 0.9 / 100)}€ GTD`, // Mock guarantee
    isRegistered: false, // Would need to check user registration
    totalPlayers: totalRegistered,
    duration: data.endTime ? 
      (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / (1000 * 60 * 60) : 
      0,
    // Clock data directly from GraphQL
    clock: data.clock
  }
})

// Tournament players data
const tournamentPlayers = computed(() => {
  // Players would need to be fetched separately with useTournamentPlayers
  return []
})

// Seating chart data
const seatingChart = computed(() => {
  // Seating chart would need to be fetched separately
  return null
})

// Get blinds structure from GraphQL data with fallback to mock
const blindsStructure = computed(() => {
  const tournamentStructure = tournamentData.value?.tournament?.structure
  
  if (tournamentStructure && tournamentStructure.length > 0) {
    return tournamentStructure.map(level => ({
      level: level.levelNumber,
      smallBlind: level.smallBlind.toString(),
      bigBlind: level.bigBlind.toString(),
      ante: level.ante ? level.ante.toString() : null,
      duration: level.isBreak ? 
        (level.breakDurationMinutes ? level.breakDurationMinutes.toString() : '15') : 
        level.durationMinutes.toString()
    }))
  }
  
  // Mock fallback structure
  return [
    { level: 1, smallBlind: '25', bigBlind: '50', ante: null, duration: '15' },
    { level: 2, smallBlind: '50', bigBlind: '100', ante: null, duration: '15' },
    { level: 3, smallBlind: '75', bigBlind: '150', ante: null, duration: '15' },
    { level: 4, smallBlind: '100', bigBlind: '200', ante: '25', duration: '15' },
    { level: 5, smallBlind: '150', bigBlind: '300', ante: '25', duration: '15' },
    { level: 6, smallBlind: '200', bigBlind: '400', ante: '50', duration: '15' },
    { level: 7, smallBlind: '300', bigBlind: '600', ante: '75', duration: '15' },
    { level: 8, smallBlind: '400', bigBlind: '800', ante: '100', duration: '15' },
    { level: 9, smallBlind: '600', bigBlind: '1200', ante: '150', duration: '15' },
    { level: 10, smallBlind: '800', bigBlind: '1600', ante: '200', duration: '15' },
    { level: 11, smallBlind: '1000', bigBlind: '2000', ante: '250', duration: '15' },
    { level: 12, smallBlind: '1500', bigBlind: '3000', ante: '400', duration: '15' },
  ]
})

// Live tournament data from subscription or API fallback
const currentLevel = computed(() => {
  // Use subscription data if available
  if (clockData.value?.tournamentClockUpdates) {
    const clock = clockData.value.tournamentClockUpdates
    console.log('🔄 Using subscription data for current level:', clock)
    
    // Use currentStructure from subscription
    if (clock.currentStructure) {
      return {
        level: clock.currentLevel,
        smallBlind: clock.currentStructure.smallBlind.toString(),
        bigBlind: clock.currentStructure.bigBlind.toString(),
        ante: clock.currentStructure.ante ? clock.currentStructure.ante.toString() : null,
        isBreak: clock.currentStructure.isBreak
      }
    }
  }
  
  // Use separate clock query data with currentStructure
  const clock = clockQueryData.value?.tournamentClock
  if (clock && clock.currentStructure) {
    console.log('📊 Using separate clock query data for current level:', clock.currentStructure)
    return {
      level: clock.currentLevel,
      smallBlind: clock.currentStructure.smallBlind.toString(),
      bigBlind: clock.currentStructure.bigBlind.toString(),
      ante: clock.currentStructure.ante ? clock.currentStructure.ante.toString() : null,
      isBreak: clock.currentStructure.isBreak || false
    }
  }
  
  // Mock fallback only if no real data
  console.log('⚠️ Using mock current level data')
  return { level: 1, smallBlind: '25', bigBlind: '50', ante: null, isBreak: false }
})

const nextLevel = computed(() => {
  // Use subscription data if available
  if (clockData.value?.tournamentClockUpdates) {
    const clock = clockData.value.tournamentClockUpdates
    console.log('🔄 Using subscription data for next level:', clock)
    
    // Use nextStructure from subscription
    if (clock.nextStructure) {
      return {
        level: clock.nextStructure.levelNumber,
        smallBlind: clock.nextStructure.smallBlind.toString(),
        bigBlind: clock.nextStructure.bigBlind.toString(),
        ante: clock.nextStructure.ante ? clock.nextStructure.ante.toString() : null,
        isBreak: clock.nextStructure.isBreak
      }
    }
  }
  
  // Use separate clock query data for next level with nextStructure
  const clock = clockQueryData.value?.tournamentClock
  if (clock && clock.nextStructure) {
    console.log('📊 Using separate clock query data for next level:', clock.nextStructure)
    return {
      level: clock.nextStructure.levelNumber,
      smallBlind: clock.nextStructure.smallBlind.toString(),
      bigBlind: clock.nextStructure.bigBlind.toString(),
      ante: clock.nextStructure.ante ? clock.nextStructure.ante.toString() : null,
      isBreak: clock.nextStructure.isBreak || false
    }
  }
  
  // Mock fallback only if no real data
  console.log('⚠️ Using mock next level data')
  return { level: 7, smallBlind: '300', bigBlind: '600', ante: '75', isBreak: false }
})

const timeRemaining = computed(() => {
  // Use subscription data if available
  if (clockData.value?.tournamentClockUpdates) {
    console.log('⏰ Using subscription data for time remaining:', clockData.value.tournamentClockUpdates.timeRemainingSeconds)
    return clockData.value.tournamentClockUpdates.timeRemainingSeconds || 0
  }
  
  // Use separate tournament clock query data
  const clock = clockQueryData.value?.tournamentClock
  console.log('⏰ Separate tournament clock query data:', {
    hasClock: !!clock,
    clockStatus: clock?.status,
    timeRemainingSeconds: clock?.timeRemainingSeconds,
    currentLevel: clock?.currentLevel,
    autoAdvance: clock?.autoAdvance,
    hasCurrentStructure: !!clock?.currentStructure,
    hasNextStructure: !!clock?.nextStructure
  })
  
  // Use clock?.timeRemainingSeconds from separate query
  if (clock?.timeRemainingSeconds !== undefined && clock?.timeRemainingSeconds !== null) {
    const remaining = Math.max(0, clock.timeRemainingSeconds)
    console.log('✅ Found valid timeRemainingSeconds from separate clock query:', remaining)
    return remaining
  }
  
  // Mock fallback only if no real data
  console.log('⚠️ Using mock time data - no real clock data available')
  return 8 * 60 + 23
})

// User seat from seating chart
const userSeat = computed(() => {
  const chart = seatingChart.value
  if (!chart) return null
  
  // Find user's seat in the seating chart
  for (const tableData of chart.tables) {
    for (const seat of tableData.seats) {
      if (seat.player && seat.assignment.isCurrent) {
        // Check if this is the current user (would need user ID comparison)
        return {
          table: tableData.table.tableNumber,
          seat: seat.assignment.seatNumber,
          chips: seat.assignment.stackSize || 0
        }
      }
    }
  }
  return null
})

// Tables data from seating chart
const tablesData = computed(() => {
  const chart = seatingChart.value
  if (!chart) return []
  
  return chart.tables.map(tableData => ({
    id: tableData.table.id,
    number: tableData.table.tableNumber,
    activePlayers: tableData.seats.filter(seat => seat.player).length,
    maxPlayers: tableData.table.maxSeats
  }))
})

// Live stats from tournament state
const liveStats = computed(() => {
  const clock = tournament.value?.clock
  const tournData = tournament.value
  
  return {
      clock: clock || null,
    playersRemaining: 0, // Would need separate query for this
    averageStack: 25000, // Mock average stack
    totalPrizePool: tournData ? Math.floor(tournData.buyInCents * tournData.registered * 0.9 / 100) : 0
  }
})

// Final results data
const finalResults = ref([
  { position: 1, name: 'Alexandre D.', payout: '870€', avatar: getPlayerAvatarWithFallback('30303030-3030-3030-3030-303030303030'), isUser: false, userId: '30303030-3030-3030-3030-303030303030' },
  { position: 2, name: 'Sophie M.', payout: '580€', avatar: getPlayerAvatarWithFallback('40404040-4040-4040-4040-404040404040'), isUser: false, userId: '40404040-4040-4040-4040-404040404040' },
  { position: 3, name: 'Thomas B.', payout: '350€', avatar: getPlayerAvatarWithFallback('50505050-5050-5050-5050-505050505050'), isUser: false, userId: '50505050-5050-5050-5050-505050505050' },
  { position: 4, name: 'Marie L.', payout: '230€', avatar: getPlayerAvatarWithFallback('60606060-6060-6060-6060-606060606060'), isUser: false, userId: '60606060-6060-6060-6060-606060606060' },
  { position: 5, name: 'Pierre V.', payout: '175€', avatar: getPlayerAvatarWithFallback('70707070-7070-7070-7070-707070707070'), isUser: false, userId: '70707070-7070-7070-7070-707070707070' },
  { position: 6, name: 'Emma R.', payout: '140€', avatar: getPlayerAvatarWithFallback('80808080-8080-8080-8080-808080808080'), isUser: false, userId: '80808080-8080-8080-8080-808080808080' },
  { position: 7, name: 'Jean-Marie', payout: '115€', avatar: getPlayerAvatarWithFallback('90909090-9090-9090-9090-909090909090'), isUser: true, userId: '90909090-9090-9090-9090-909090909090' },
])

const userResult = computed(() => {
  return finalResults.value.find(r => r.isUser)
})

// Methods
const getStatusClass = (status: string) => {
  switch(status) {
    case 'UPCOMING':
    case 'upcoming': return 'pp-status-upcoming'
    case 'IN_PROGRESS':
    case 'live': return 'pp-status-live'  
    case 'COMPLETED':
    case 'completed': return 'pp-status-completed'
    default: return 'pp-status-default'
  }
}

const formatDateTime = (date: Date) => {
  return date.toLocaleDateString(locale.value, { 
    weekday: 'short',
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTimeRemaining = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatChips = (chips: number) => {
  if (chips >= 1000000) {
    return `${(chips / 1000000).toFixed(1)}M`
  } else if (chips >= 1000) {
    return `${(chips / 1000).toFixed(1)}K`
  }
  return chips.toString()
}

const formatDuration = (hours: number) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

const registerForTournament = () => {
  if (tournament.value) {
    tournament.value.isRegistered = true
    tournament.value.registered++
    tournament.value.spotsLeft--
  }
}

const unregisterFromTournament = () => {
  if (tournament.value) {
    tournament.value.isRegistered = false
    tournament.value.registered--
    tournament.value.spotsLeft++
  }
}

const shareTournament = () => {
  // Share functionality
  console.log('Share tournament')
}

const viewFullSeatingChart = () => {
  // Navigate to full seating chart
  console.log('View full seating chart')
}

const handleRefresh = async (ev: CustomEvent) => {
  try {
    await refetchTournament()
  } finally {
    ;(ev.target as any)?.complete?.()
  }
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // Try .png extension if .jpg failed
  if (img.src.endsWith('.jpg')) {
    img.src = img.src.replace('.jpg', '.png')
  } else {
    // Fallback to default avatar
    img.src = '/assets/images/jmvdb.png'
  }
}

onMounted(() => {
  // Expose debug method to global scope for manual testing
  if (import.meta.client) {
    // @ts-ignore
    window.debugSendInit = debugSendInit
  }
  
  // Set up periodic refresh for clock data every 10 seconds as fallback
  timer.value = setInterval(() => {
    if (!clockConnected.value) {
      console.log('🔄 Subscription not connected, refreshing clock query...')
      refetchClock()
    }
  }, 10000)
  
  // Monitor subscription connection status
  watch([clockConnected, clockError], ([connected, error]) => {
    console.log('📡 Subscription status:', { connected, error })
    if (!connected && error) {
      console.log('❌ Subscription error, falling back to query refresh')
    }
  }, { immediate: true })
})

onUnmounted(() => {
  // Timer cleanup no longer needed since we use subscription
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.pp-tournament-detail {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.pp-section {
  padding: 16px;
  margin-bottom: 16px;
}

/* Tournament Header */
.pp-tournament-header-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
}

.pp-tournament-title-section {
  margin-bottom: 16px;
}

.pp-tournament-name {
  color: #fee78a;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.pp-tournament-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pp-tournament-type {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
}

.pp-type-deepstack {
  --background: rgba(34, 197, 94, 0.2);
  --color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.pp-tournament-club {
  color: #94a3b8;
  font-size: 14px;
}

.pp-status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
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

/* Key Info Grid */
.pp-key-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.pp-info-card {
  background: rgba(100, 116, 139, 0.08);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.pp-info-icon {
  color: #64748b;
  font-size: 20px;
  min-width: 20px;
}

.pp-info-content {
  flex: 1;
}

.pp-info-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.pp-info-value {
  color: #fee78a;
  font-size: 14px;
  font-weight: 600;
}

/* Section Titles */
.pp-section-title {
  color: #fee78a;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Registration Card */
.pp-registration-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.pp-registration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pp-spots-available {
  color: #22c55e;
  font-size: 14px;
  font-weight: 600;
}

.pp-spots-full {
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
}

.pp-register-btn {
  margin-bottom: 12px;
  font-weight: 600;
}

.pp-button-primary {
  --background: linear-gradient(135deg, #64748b, #475569);
  --color: white;
}

.pp-button-warning {
  --background: linear-gradient(135deg, #f59e0b, #d97706);
  --color: white;
}

.pp-button-disabled {
  --background: rgba(84, 84, 95, 0.3);
  --color: #54545f;
}

.pp-registration-deadline {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
}

/* Blinds Structure */
.pp-blinds-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 20px;
}

.pp-blinds-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pp-blinds-header {
  display: grid;
  grid-template-columns: 60px 80px 80px 60px 1fr;
  gap: 8px;
  padding: 12px 8px;
  background: rgba(84, 84, 95, 0.1);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-blinds-row {
  display: grid;
  grid-template-columns: 60px 80px 80px 60px 1fr;
  gap: 8px;
  padding: 12px 8px;
  background: rgba(100, 116, 139, 0.05);
  border-radius: 8px;
  font-size: 13px;
  transition: background 0.2s ease;
}

.pp-blinds-row:hover {
  background: rgba(100, 116, 139, 0.1);
}

.pp-level {
  color: #fee78a;
  font-weight: 600;
}

.pp-sb, .pp-bb {
  color: #e2e8f0;
  font-weight: 500;
}

.pp-ante {
  color: #94a3b8;
  font-weight: 400;
}

.pp-duration {
  color: #94a3b8;
  font-weight: 400;
}

/* Live Clock */
.pp-live-clock-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 2px solid #ef4444;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

.pp-clock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pp-live-indicator {
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-live 2s ease-in-out infinite;
}

.pp-current-level {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.pp-clock-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.pp-time-remaining {
  text-align: center;
}

.pp-time-value {
  color: #ef4444;
  font-size: 48px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  margin-bottom: 4px;
}

.pp-time-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-current-blinds {
  text-align: center;
}

.pp-blinds-current {
  color: #fee78a;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pp-blinds-separator {
  color: #64748b;
  margin: 0 8px;
}

.pp-blinds-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.pp-ante-current {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
}

.pp-next-level {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(84, 84, 95, 0.1);
  border-radius: 8px;
  font-size: 14px;
}

.pp-next-label {
  color: #94a3b8;
  font-weight: 500;
}

.pp-next-blinds {
  color: #fee78a;
  font-weight: 600;
}

.pp-next-ante {
  color: #94a3b8;
  font-weight: 400;
}

.pp-next-break {
  color: #f59e0b;
  font-weight: 600;
  font-size: 14px;
}

/* Break Display */
.pp-break-info {
  text-align: center;
}

.pp-break-text {
  color: #f59e0b;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pp-break-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Seating Chart */
.pp-seating-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.pp-seating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pp-view-all-btn {
  --color: #64748b;
  --color-hover: #fee78a;
  font-size: 12px;
}

.pp-user-seat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(254, 231, 138, 0.1);
  border: 1px solid rgba(254, 231, 138, 0.3);
  border-radius: 12px;
  margin-bottom: 16px;
}

.pp-seat-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pp-seat-icon {
  color: #fee78a;
  font-size: 20px;
}

.pp-seat-table {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
}

.pp-seat-position {
  color: #94a3b8;
  font-size: 12px;
}

.pp-seat-stack {
  text-align: right;
}

.pp-stack-value {
  color: #fee78a;
  font-size: 18px;
  font-weight: 700;
}

.pp-stack-label {
  color: #94a3b8;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-tables-summary {
  margin-top: 16px;
}

.pp-tables-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.pp-table-mini {
  background: rgba(100, 116, 139, 0.1);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}

.pp-table-number {
  color: #fee78a;
  font-size: 14px;
  font-weight: 600;
}

.pp-table-players {
  color: #94a3b8;
  font-size: 10px;
}

.pp-more-tables {
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
}

/* Live Stats */
.pp-live-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.pp-stat-item {
  background: rgba(100, 116, 139, 0.08);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.pp-stat-value {
  color: #fee78a;
  font-size: 18px;
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

/* Results */
.pp-results-summary {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.pp-tournament-complete-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pp-complete-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pp-complete-label {
  color: #94a3b8;
  font-size: 14px;
}

.pp-complete-value {
  color: #fee78a;
  font-size: 14px;
  font-weight: 600;
}

/* Podium */
.pp-podium-section {
  margin-bottom: 24px;
}

.pp-podium {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 8px;
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

.pp-podium-payout {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

/* User Result */
.pp-user-result {
  background: linear-gradient(135deg, rgba(254, 231, 138, 0.1), rgba(24, 24, 26, 0.95));
  border: 1px solid #fee78a;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.pp-user-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pp-user-result-title {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.pp-user-position {
  color: #fee78a;
  font-size: 24px;
  font-weight: 700;
}

.pp-position-top {
  color: #22c55e;
}

.pp-user-result-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pp-result-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pp-result-label {
  color: #94a3b8;
  font-size: 14px;
}

.pp-result-value {
  font-size: 14px;
  font-weight: 600;
}

.pp-profit {
  color: #22c55e;
}

.pp-loss {
  color: #ef4444;
}

/* Full Results */
.pp-full-results {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 20px;
}

.pp-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pp-results-title {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.pp-toggle-results {
  --color: #64748b;
  --color-hover: #fee78a;
  font-size: 12px;
}

.pp-results-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pp-results-table-header {
  display: grid;
  grid-template-columns: 80px 1fr 100px;
  gap: 12px;
  padding: 12px;
  background: rgba(84, 84, 95, 0.1);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-results-row {
  display: grid;
  grid-template-columns: 80px 1fr 100px;
  gap: 12px;
  padding: 12px;
  background: rgba(100, 116, 139, 0.05);
  border-radius: 8px;
  font-size: 13px;
  transition: background 0.2s ease;
}

.pp-results-row:hover {
  background: rgba(100, 116, 139, 0.1);
}

.pp-user-row {
  background: rgba(254, 231, 138, 0.1);
  border: 1px solid rgba(254, 231, 138, 0.3);
}

.pp-position {
  color: #fee78a;
  font-weight: 600;
}

.pp-player-name {
  color: #e2e8f0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pp-user-icon {
  color: #fee78a;
  font-size: 14px;
}

.pp-payout {
  color: #22c55e;
  font-weight: 600;
  text-align: right;
}

/* Loading State */
.pp-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #94a3b8;
  font-size: 16px;
}

.pp-loading-state ion-spinner {
  margin-bottom: 16px;
  --color: #fee78a;
}

/* Error State */
.pp-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
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

/* Animations */
@keyframes pulse-live {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(239, 68, 68, 0.7); }
  50% { opacity: 0.5; box-shadow: 0 0 16px rgba(239, 68, 68, 1); }
}

/* Responsive Design */
@media (max-width: 480px) {
  .pp-key-info-grid {
    grid-template-columns: 1fr;
  }
  
  .pp-clock-display {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .pp-time-value {
    font-size: 36px;
  }
  
  .pp-blinds-current {
    font-size: 24px;
  }
  
  .pp-tables-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .pp-live-stats {
    grid-template-columns: 1fr;
  }
  
  .pp-blinds-header,
  .pp-blinds-row {
    grid-template-columns: 40px 60px 60px 40px 1fr;
    font-size: 11px;
  }
}
</style>