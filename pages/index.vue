<template>
    <IonPage class="pp-page">
        <!-- Premium Header -->
        <IonHeader :translucent="true" class="pp-header">
            <IonToolbar class="pp-toolbar">
                <IonTitle class="pp-title">{{ t('app.title') }}</IonTitle>
                <IonButtons slot="end">
                    <IonButton id="language-trigger" class="pp-header-button">
                        <IonIcon :icon="languageOutline" />
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

            <!-- Welcome Card -->
            <section class="pp-section">
                <div class="pp-welcome-card">
                    <div class="pp-welcome-content">
                        <div class="pp-welcome-text">
                            <p class="pp-welcome-label">{{ isAuthenticated ? t('home.welcomeBack') : t('home.welcome') }}</p>
                            <h2 class="pp-welcome-title">
                              {{ isAuthenticated 
                                ? t('home.trackYourEdge', { username }) 
                                : t('home.explorePocketPair')
                              }}
                            </h2>
                            <p v-if="isAuthenticated && clubStore.selectedClub?.name" class="pp-club-info">
                                <IonIcon :icon="locationOutline" />
                                {{ clubStore.selectedClub?.name }}
                            </p>
                            <p v-else class="pp-club-info">
                                <IonIcon :icon="locationOutline" />
                                {{ t('home.browseClubs') }}
                            </p>
                        </div>
                        <div v-if="isAuthenticated" class="pp-avatar-container">
                            <div class="pp-avatar-glow"></div>
                            <IonAvatar class="pp-avatar">
                                <img :src="`images/players/${currentUser?.id}.jpg`" alt="avatar" />
                            </IonAvatar>
                        </div>
                        <div v-else class="pp-guest-icon-container">
                            <img src="@/assets/icon-no-bg.png" alt="PocketPair" class="pp-guest-logo" />
                        </div>
                    </div>
                    
                    <!-- Premium KPI Cards (only for authenticated users) -->
                    <div v-if="isAuthenticated" class="pp-kpi-grid">
                        <div class="pp-kpi-card">
                            <div class="pp-kpi-label">{{ t('home.kpis.itm') }}</div>
                            <div class="pp-kpi-value">{{ kpis.itm }}%</div>
                            <div class="pp-progress-bar">
                                <div class="pp-progress-fill" :style="`width: ${kpis.itm}%`"></div>
                            </div>
                        </div>
                        <div class="pp-kpi-card">
                            <div class="pp-kpi-label">{{ t('home.kpis.roi') }}</div>
                            <div class="pp-kpi-value">{{ kpis.roi }}%</div>
                            <div class="pp-progress-bar">
                                <div class="pp-progress-fill" :style="`width: ${Math.min(kpis.roi * 2, 100)}%`"></div>
                            </div>
                        </div>
                        <div class="pp-kpi-card">
                            <div class="pp-kpi-label">{{ t('home.kpis.cashes') }}</div>
                            <div class="pp-kpi-value">{{ kpis.cashes }}</div>
                            <div class="pp-progress-bar">
                                <div class="pp-progress-fill" :style="`width: ${Math.min(kpis.cashes * 8, 100)}%`"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Login CTA for guests -->
                    <div v-else class="pp-login-cta">
                        <div class="pp-cta-content">
                            <h3 class="pp-cta-title">{{ t('home.unlockFeatures') }}</h3>
                            <p class="pp-cta-subtitle">{{ t('home.ctaDescription') }}</p>
                            <div class="pp-cta-buttons">
                                <IonButton @click="navigateTo('/login')" class="pp-cta-login">
                                    {{ t('auth.login') }}
                                </IonButton>
                                <IonButton @click="navigateTo('/register')" fill="outline" class="pp-cta-register">
                                    {{ t('auth.register') }}
                                </IonButton>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Quick Actions -->
            <section class="pp-section">
              <div class="pp-actions-grid">
                <div class="pp-action-card" @click="$router.push('/tournaments')">
                    <div class="pp-action-icon">
                        <IonIcon :icon="calendarOutline" />
                    </div>
                    <div class="pp-action-content">
                      <div class="pp-action-title">{{ t('home.actions.upcoming') }}</div>
                      <div class="pp-action-subtitle">{{ t('home.actions.upcomingSubtitle') }}</div>
                    </div>
                </div>

                <div class="pp-action-card" @click="$router.push('/registrations')">
                    <div class="pp-action-icon">
                        <IonIcon :icon="fileTrayFullOutline" />
                    </div>
                    <div class="pp-action-content">
                      <div class="pp-action-title">{{ t('home.actions.myRegistrations') }}</div>
                      <div class="pp-action-subtitle">{{ t('home.actions.myRegistrationsSubtitle') }}</div>
                    </div>
                </div>

                <div class="pp-action-card" @click="$router.push('/leaderboard')">
                    <div class="pp-action-icon pp-action-icon-trophy">
                        <IonIcon :icon="trophyOutline" />
                    </div>
                    <div class="pp-action-content">
                        <div class="pp-action-title">{{ t('home.actions.leaderboard') }}</div>
                        <div class="pp-action-subtitle">{{ t('home.actions.leaderboardSubtitle') }}</div>
                    </div>
                </div>
              </div>
            </section>

            <!-- Progress Section -->
            <section class="pp-section">
                <div class="pp-card">
                    <div class="pp-card-header">
                        <h3 class="pp-card-title">{{ t('home.progress.title', { range: selectedRangeLabel }) }}</h3>
                        <p class="pp-card-subtitle">{{ t('home.progress.subtitle') }}</p>
                    </div>
                    <div class="pp-card-content">
                        <IonSegment value="month" @ionChange="onRangeChange" class="pp-segment">
                            <IonSegmentButton value="week" class="pp-segment-button"><IonLabel>{{ t('home.progress.timeLabels.7d') }}</IonLabel></IonSegmentButton>
                            <IonSegmentButton value="month" class="pp-segment-button"><IonLabel>{{ t('home.progress.timeLabels.30d') }}</IonLabel></IonSegmentButton>
                            <IonSegmentButton value="year" class="pp-segment-button"><IonLabel>{{ t('home.progress.timeLabels.1y') }}</IonLabel></IonSegmentButton>
                        </IonSegment>
                        
                        <div class="pp-chart-placeholder">
                            <div class="pp-chart-text">{{ t('home.progress.chartPlaceholder') }}</div>
                        </div>
                        
                        <div class="pp-stats-grid">
                            <div class="pp-stat-item">
                                <div class="pp-stat-icon">
                                    <IonIcon :icon="statsChartOutline" />
                                </div>
                                <div class="pp-stat-content">
                                    <div class="pp-stat-label">ITM</div>
                                    <div class="pp-stat-value">{{ kpis.itm }}%</div>
                                </div>
                            </div>
                            <div class="pp-stat-item">
                                <div class="pp-stat-icon">
                                    <IonIcon :icon="trendingUpOutline" />
                                </div>
                                <div class="pp-stat-content">
                                    <div class="pp-stat-label">ROI</div>
                                    <div class="pp-stat-value">{{ kpis.roi }}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Next Tournaments -->
            <section class="pp-section">
                <div class="pp-section-header">
                    <h3 class="pp-section-title">
                        <IonIcon :icon="calendarNumberOutline" />
                        Next tournaments
                    </h3>
                    <IonButton fill="clear" size="small" :routerLink="'/tournaments'" class="pp-see-all-button">{{ t('home.tournaments.seeAll') }}</IonButton>
                </div>
                <div v-if="nextTournaments.length > 0" class="pp-tournament-list">
                    <div v-for="tournament in nextTournaments" :key="tournament.id" class="pp-tournament-card">
                        <div class="pp-tournament-info">
                            <h4 class="pp-tournament-name">{{ tournament.title }}</h4>
                            <p class="pp-tournament-details">{{ formatDateTime(tournament.startTime, locale) }} · {{ currencyCents(tournament.buyInCents) }}</p>
                        </div>
                        <div class="pp-tournament-actions">
                            <IonChip v-if="!isTournamentFull" class="pp-spots-chip">
                                {{ t('home.tournaments.spotsLeft', { count: spotsLeft(tournament) }) }}
                            </IonChip>
                            <IonButton 
                                v-if="isAuthenticated"
                                size="small" 
                                :disabled="isTournamentFull(tournament)"
                                :class="isTournamentFull(tournament)? 'pp-button-disabled' : 'pp-button-primary'"
                            >
                                {{ isTournamentFull(tournament) ? t('home.tournaments.full') : t('home.tournaments.register') }}
                            </IonButton>
                            <IonButton 
                                v-else
                                size="small" 
                                @click="navigateTo('/login')"
                                class="pp-button-login"
                            >
                                <IonIcon :icon="logInOutline" slot="start" />
                                {{ t('auth.loginToRegister') }}
                            </IonButton>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Recent Results -->
            <section class="pp-section pp-last-section">
                <div class="pp-section-header">
                    <h3 class="pp-section-title">
                        <IonIcon :icon="podiumOutline" />
                        {{ t('home.results.title') }}
                    </h3>
                    <IonButton fill="clear" size="small" :routerLink="'/results'" class="pp-see-all-button">{{ t('home.results.seeAll') }}</IonButton>
                </div>
                <div class="pp-results-list">
                    <div v-for="r in recentResults" :key="r.id" class="pp-result-card" @click="$router.push(`/results/${r.id}`)">
                        <div class="pp-result-info">
                            <h4 class="pp-result-position">#{{ r.place }} · {{ r.tournament }}</h4>
                            <p class="pp-result-details">{{ r.date }} · {{ t('home.results.buyIn') }} {{ currency(r.buyIn) }} · {{ t('home.results.cash') }} {{ currency(r.cash) }}</p>
                        </div>
                        <IonBadge :class="r.profit >= 0 ? 'pp-profit-badge' : 'pp-loss-badge'">
                            {{ r.profit >= 0 ? '+' : '' }}{{ currency(r.profit) }}
                        </IonBadge>
                    </div>
                </div>
            </section>


            <!-- Language Selector Popover -->
            <IonPopover trigger="language-trigger" :dismissOnSelect="true" class="pp-popover">
                <IonContent class="pp-popover-content">
                    <div class="pp-popover-items">
                        <div class="pp-popover-item" @click="switchLanguage('en')">
                            <span class="pp-popover-text">English</span>
                            <IonIcon v-if="locale === 'en'" :icon="checkmarkOutline" class="pp-popover-check" />
                        </div>
                        <div class="pp-popover-item" @click="switchLanguage('fr')">
                            <span class="pp-popover-text">Français</span>
                            <IonIcon v-if="locale === 'fr'" :icon="checkmarkOutline" class="pp-popover-check" />
                        </div>
                        <div class="pp-popover-item" @click="switchLanguage('nl')">
                            <span class="pp-popover-text">Nederlands</span>
                            <IonIcon v-if="locale === 'nl'" :icon="checkmarkOutline" class="pp-popover-check" />
                        </div>
                    </div>
                </IonContent>
            </IonPopover>

        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {
    IonAvatar,
    IonBadge,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonPage,
    IonPopover,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
} from '@ionic/vue'
import ClubSelector from '~/components/ClubSelector.vue'
import { useClubStore } from '~/stores/useClubStore'
import { useAuthStore } from '~/stores/useAuthStore'
import {
    calendarNumberOutline,
    calendarOutline,
    checkmarkOutline,
    fileTrayFullOutline,
    languageOutline,
    locationOutline,
    logInOutline,
    podiumOutline,
    statsChartOutline,
    trendingUpOutline,
    trophyOutline,
} from 'ionicons/icons'
import { ref, computed, watch } from 'vue'
import { formatDate, formatDateTime } from "~/utils/datetime";
import { currency, currencyCents } from "~/utils/currency";

// Language switching
const { t, locale, switchLanguage } = useI18n()

// Authentication
const authStore = useAuthStore()
const { isAuthenticated, currentUser } = storeToRefs(authStore)

const isTournamentFull = (tournament: any) => {
    if (!tournament.seatCap) return false;
    return (tournament.registrations?.length || 0) >= tournament.seatCap;
}

const spotsLeft = (tournament: any) => {
    if (!tournament.seatCap) return '∞';
    return Math.max(tournament.seatCap - (tournament.registrations?.length || 0), 0);
}

// Player-centric defaults
const username = computed(() => {
  if (isAuthenticated.value && currentUser.value) {
    return currentUser.value.username ?? currentUser.value.firstName
  }
  return 'Guest' // Should not happen
})

// Club store
const clubStore = useClubStore()

// Next 5 tournaments
const nextTournaments = ref<any[]>([])

const fetchTournaments = async () => {
  if (!clubStore.selectedClub?.id) {
    nextTournaments.value = []
    return
  }
  
  try {
    const res = await GqlGetTournaments({ 
      clubId: clubStore.selectedClub.id,
      status: 'UPCOMING' as any,
      limit: 5
    })
    nextTournaments.value = res.tournaments || []
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    nextTournaments.value = []
  }
}

// Watch for club changes and refetch
watch(() => clubStore.selectedClub, fetchTournaments, { immediate: true })

// Progress range selector
const selectedRange = ref<'week' | 'month' | 'year'>('month')
const selectedRangeLabel = computed(() => {
  const ranges = { week: '7 days', month: '30 days', year: '1 year' }
  return ranges[selectedRange.value]
})
const onRangeChange = (e: CustomEvent) => { selectedRange.value = e.detail.value }

// KPIs fetched from API
const statsData = ref<any>(null)

const kpis = computed(() => {
  if (!statsData.value) return { itm: 0, roi: 0, cashes: 0 }
  const rangeMap: Record<string, string> = { week: 'last7Days', month: 'last30Days', year: 'lastYear' }
  const period = statsData.value[rangeMap[selectedRange.value]] || statsData.value.last30Days
  return {
    itm: Math.round(period.itmPercentage ?? 0),
    roi: Math.round(period.roiPercentage ?? 0),
    cashes: period.totalItm ?? 0
  }
})

const fetchStats = async () => {
  if (!isAuthenticated.value) return
  try {
    const res = await GqlGetMyTournamentStatistics()
    statsData.value = res.myTournamentStatistics
  } catch (e) {
    console.error('Error fetching statistics:', e)
  }
}

// Recent results fetched from API
const recentResults = ref<any[]>([])

const fetchRecentResults = async () => {
  if (!isAuthenticated.value) return
  try {
    const res = await GqlGetMyRecentTournamentResults({ limit: 5 })
    recentResults.value = (res.myRecentTournamentResults || []).map((item: any) => ({
      id: item.result.id,
      tournament: item.tournament.title,
      date: formatDate(item.tournament.startTime, locale.value),
      place: item.result.finalPosition,
      buyIn: item.tournament.buyInCents / 100,
      cash: item.result.prizeCents / 100,
      profit: (item.result.prizeCents - item.tournament.buyInCents) / 100
    }))
  } catch (e) {
    console.error('Error fetching recent results:', e)
    recentResults.value = []
  }
}

// Fetch user data on mount
if (isAuthenticated.value) {
  fetchStats()
  fetchRecentResults()
}

const handleRefresh = async (ev: CustomEvent) => {
    try {
      await Promise.all([
        fetchTournaments(),
        fetchStats(),
        fetchRecentResults()
      ])
    } finally {
      setTimeout(() => { (ev.target as any)?.complete?.() }, 100)
    }
}

</script>

<style scoped>
/* Welcome Card */
.pp-welcome-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.pp-welcome-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.pp-welcome-text {
  flex: 1;
  padding-right: 16px;
}

.pp-welcome-label {
  color: #54545f;
  font-size: 14px;
  font-weight: 400;
  margin: 0 0 4px 0;
}

.pp-welcome-title {
  color: #fee78a;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.pp-club-info {
  color: #54545f;
  font-size: 12px;
  font-weight: 400;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pp-avatar-container {
  position: relative;
}

.pp-guest-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: #1a1b17;
  border: 2px solid rgba(254, 231, 138, 0.3);
  border-radius: 50%;
  position: relative;
  padding: 12px;
}

.pp-guest-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* KPI Cards */
.pp-kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.pp-kpi-card {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.08), rgba(71, 85, 105, 0.08));
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.pp-kpi-card:hover {
  border-color: rgba(100, 116, 139, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(100, 116, 139, 0.15);
}

.pp-kpi-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.pp-kpi-value {
  color: #fee78a;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.pp-progress-bar {
  height: 3px;
  background: rgba(84, 84, 95, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.pp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #64748b, #475569);
  transition: width 0.5s ease;
}

/* Login CTA */
.pp-login-cta {
  margin-top: 24px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(254, 231, 138, 0.1), rgba(251, 191, 36, 0.05));
  border: 1px solid rgba(254, 231, 138, 0.3);
  border-radius: 16px;
  text-align: center;
}

.pp-cta-content {
  max-width: 300px;
  margin: 0 auto;
}

.pp-cta-title {
  color: #fee78a;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.pp-cta-subtitle {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.4;
  margin: 0 0 20px 0;
}

.pp-cta-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.pp-cta-login {
  --background: linear-gradient(135deg, #fee78a, #fbbf24);
  --color: #18181a;
  --border-radius: 12px;
  height: 44px;
  font-weight: 600;
  font-size: 14px;
  flex: 1;
  max-width: 120px;
}

.pp-cta-register {
  --color: #fee78a;
  --border-color: #fee78a;
  --border-radius: 12px;
  height: 44px;
  font-weight: 600;
  font-size: 14px;
  flex: 1;
  max-width: 120px;
}

/* Action Cards - index page specific */
.pp-actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

/* Override action card padding for index page */
.pp-action-card {
  padding: 20px;
}

/* Larger action icons on index page */
.pp-action-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(71, 85, 105, 0.15));
  border: 1px solid rgba(100, 116, 139, 0.4);
  font-size: 24px;
}

.pp-action-icon-trophy {
  background: linear-gradient(135deg, rgba(71, 85, 105, 0.25), rgba(100, 116, 139, 0.15));
}

/* Override action title color for index page */
.pp-action-title {
  color: #fee78a;
  margin-bottom: 4px;
}

/* Card Styles - index page specific additions */
.pp-card {
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.pp-card-header {
  padding: 20px 20px 0;
  border-bottom: 1px solid rgba(84, 84, 95, 0.2);
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.pp-card-title {
  color: #fee78a;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.pp-card-subtitle {
  color: #54545f;
  font-size: 12px;
  font-weight: 400;
  margin: 0;
}

.pp-card-content {
  padding: 0 20px 20px;
}

/* Segment - override margin for index page */
.pp-segment {
  margin-bottom: 20px;
}

.pp-chart-placeholder {
  background: rgba(84, 84, 95, 0.1);
  border: 1px solid rgba(84, 84, 95, 0.2);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  margin-bottom: 20px;
}

.pp-chart-text {
  color: #54545f;
  font-size: 14px;
}

.pp-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pp-stat-item {
  background: rgba(100, 116, 139, 0.08);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.pp-stat-icon {
  width: 36px;
  height: 36px;
  background: rgba(100, 116, 139, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e2e8f0;
  font-size: 18px;
}

.pp-stat-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
  margin-bottom: 2px;
}

.pp-stat-value {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
}

/* Section Headers */
.pp-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pp-section-title {
  color: #fee78a;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pp-see-all-button {
  --color: #64748b;
  --color-hover: #fee78a;
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
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.pp-tournament-card:hover {
  border-color: #64748b;
  transform: translateY(-1px);
}

.pp-tournament-info {
  flex: 1;
}

.pp-tournament-name {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.pp-tournament-details {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
  margin: 0;
}

.pp-tournament-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pp-spots-chip {
  --background: rgba(100, 116, 139, 0.15);
  --color: #e2e8f0;
  border: 1px solid rgba(100, 116, 139, 0.4);
  font-size: 11px;
  font-weight: 500;
}

/* Results List */
.pp-results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pp-result-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pp-result-card:hover {
  border-color: #64748b;
  transform: translateY(-1px);
}

.pp-result-info {
  flex: 1;
}

.pp-result-position {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.pp-result-details {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
  margin: 0;
}

.pp-profit-badge {
  --background: linear-gradient(135deg, #10b981, #059669);
  --color: white;
  font-weight: 700;
  font-size: 12px;
  border-radius: 6px;
  padding: 4px 8px;
}

.pp-loss-badge {
  --background: rgba(239, 68, 68, 0.2);
  --color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  font-weight: 600;
  font-size: 12px;
  border-radius: 6px;
  padding: 4px 8px;
}
</style>