<template>
    <IonPage class="pp-page">
        <!-- Premium Header -->
        <IonHeader :translucent="true" class="pp-header">
            <IonToolbar class="pp-toolbar">
                <IonTitle class="pp-title">{{ $t('app.title') }}</IonTitle>
                <IonButtons slot="end">
                    <IonButton id="language-trigger" class="pp-header-button">
                        <IonIcon :icon="languageOutline" />
                    </IonButton>
                </IonButtons>
            </IonToolbar>
            <IonToolbar class="pp-sub-toolbar">
                <IonButtons slot="start">
                    <IonButton id="club-select-trigger" class="pp-club-button">
                        <IonIcon :icon="locationOutline" />
                        <span class="pp-club-name">{{ activeClub?.name || $t('home.selectClub') }}</span>
                        <IonIcon :icon="chevronDownOutline" />
                    </IonButton>
                </IonButtons>
                <IonButtons slot="end">
                    <IonButton @click="refresh()" class="pp-header-button">
                        <IonIcon :icon="refreshOutline" />
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true" class="pp-content">
            <!-- Pull to refresh -->
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent :pulling-text="$t('common.pullToRefresh')" refreshing-spinner="dots" />
            </IonRefresher>

            <!-- Premium Welcome Card -->
            <section class="pp-section">
                <div class="pp-welcome-card">
                    <div class="pp-welcome-content">
                        <div class="pp-welcome-text">
                            <p class="pp-welcome-label">{{ isAuthenticated ? $t('home.welcomeBack') : $t('home.welcome') }}</p>
                            <h2 class="pp-welcome-title">
                              {{ isAuthenticated 
                                ? $t('home.trackYourEdge', { username }) 
                                : $t('home.explorePocketPair')
                              }}
                            </h2>
                            <p v-if="isAuthenticated && activeClub?.name" class="pp-club-info">
                                <IonIcon :icon="locationOutline" />
                                {{ activeClub?.name }}
                            </p>
                            <p v-else class="pp-club-info">
                                <IonIcon :icon="locationOutline" />
                                {{ $t('home.browseClubs') }}
                            </p>
                        </div>
                        <div v-if="isAuthenticated" class="pp-avatar-container">
                            <div class="pp-avatar-glow"></div>
                            <IonAvatar class="pp-avatar">
                                <img :src="avatarUrl" alt="avatar" />
                            </IonAvatar>
                        </div>
                        <div v-else class="pp-guest-icon-container">
                            <img src="@/assets/icon-no-bg.png" alt="PocketPair" class="pp-guest-logo" />
                        </div>
                    </div>
                    
                    <!-- Premium KPI Cards (only for authenticated users) -->
                    <div v-if="isAuthenticated" class="pp-kpi-grid">
                        <div class="pp-kpi-card">
                            <div class="pp-kpi-label">{{ $t('home.kpis.itm') }}</div>
                            <div class="pp-kpi-value">{{ kpis.itm }}%</div>
                            <div class="pp-progress-bar">
                                <div class="pp-progress-fill" :style="`width: ${kpis.itm}%`"></div>
                            </div>
                        </div>
                        <div class="pp-kpi-card">
                            <div class="pp-kpi-label">{{ $t('home.kpis.roi') }}</div>
                            <div class="pp-kpi-value">{{ kpis.roi }}%</div>
                            <div class="pp-progress-bar">
                                <div class="pp-progress-fill" :style="`width: ${Math.min(kpis.roi * 2, 100)}%`"></div>
                            </div>
                        </div>
                        <div class="pp-kpi-card">
                            <div class="pp-kpi-label">{{ $t('home.kpis.cashes') }}</div>
                            <div class="pp-kpi-value">{{ kpis.cashes }}</div>
                            <div class="pp-progress-bar">
                                <div class="pp-progress-fill" :style="`width: ${Math.min(kpis.cashes * 8, 100)}%`"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Login CTA for guests -->
                    <div v-else class="pp-login-cta">
                        <div class="pp-cta-content">
                            <h3 class="pp-cta-title">{{ $t('home.unlockFeatures') }}</h3>
                            <p class="pp-cta-subtitle">{{ $t('home.ctaDescription') }}</p>
                            <div class="pp-cta-buttons">
                                <IonButton @click="navigateTo('/login')" class="pp-cta-login">
                                    {{ $t('auth.login') }}
                                </IonButton>
                                <IonButton @click="navigateTo('/register')" fill="outline" class="pp-cta-register">
                                    {{ $t('auth.register') }}
                                </IonButton>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Premium Quick Actions -->
            <section class="pp-section">
              <div class="pp-actions-grid">
                <div class="pp-action-card" @click="$router.push('/tournaments')">
                    <div class="pp-action-icon">
                        <IonIcon :icon="calendarOutline" />
                    </div>
                    <div class="pp-action-content">
                      <div class="pp-action-title">{{ $t('home.actions.upcoming') }}</div>
                      <div class="pp-action-subtitle">{{ $t('home.actions.upcomingSubtitle') }}</div>
                    </div>
                </div>

                <div class="pp-action-card" @click="$router.push('/registrations')">
                    <div class="pp-action-icon">
                        <IonIcon :icon="fileTrayFullOutline" />
                    </div>
                    <div class="pp-action-content">
                      <div class="pp-action-title">{{ $t('home.actions.myRegistrations') }}</div>
                      <div class="pp-action-subtitle">{{ $t('home.actions.myRegistrationsSubtitle') }}</div>
                    </div>
                </div>

                <div class="pp-action-card" @click="$router.push('/leaderboard')">
                    <div class="pp-action-icon pp-action-icon-trophy">
                        <IonIcon :icon="trophyOutline" />
                    </div>
                    <div class="pp-action-content">
                        <div class="pp-action-title">{{ $t('home.actions.leaderboard') }}</div>
                        <div class="pp-action-subtitle">{{ $t('home.actions.leaderboardSubtitle') }}</div>
                    </div>
                </div>
              </div>
            </section>

            <!-- Premium Progress Section -->
            <section class="pp-section">
                <div class="pp-card">
                    <div class="pp-card-header">
                        <h3 class="pp-card-title">{{ $t('home.progress.title', { range: selectedRangeLabel }) }}</h3>
                        <p class="pp-card-subtitle">{{ $t('home.progress.subtitle') }}</p>
                    </div>
                    <div class="pp-card-content">
                        <IonSegment value="month" @ionChange="onRangeChange" class="pp-segment">
                            <IonSegmentButton value="week" class="pp-segment-button"><IonLabel>{{ $t('home.progress.timeLabels.7d') }}</IonLabel></IonSegmentButton>
                            <IonSegmentButton value="month" class="pp-segment-button"><IonLabel>{{ $t('home.progress.timeLabels.30d') }}</IonLabel></IonSegmentButton>
                            <IonSegmentButton value="year" class="pp-segment-button"><IonLabel>{{ $t('home.progress.timeLabels.1y') }}</IonLabel></IonSegmentButton>
                        </IonSegment>
                        
                        <div class="pp-chart-placeholder">
                            <div class="pp-chart-text">{{ $t('home.progress.chartPlaceholder') }}</div>
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

            <!-- Premium Next Tournaments -->
            <section class="pp-section">
                <div class="pp-section-header">
                    <h3 class="pp-section-title">
                        <IonIcon :icon="calendarNumberOutline" />
                        Next tournaments
                    </h3>
                    <IonButton fill="clear" size="small" :routerLink="'/tournaments'" class="pp-see-all-button">{{ $t('home.tournaments.seeAll') }}</IonButton>
                </div>
                <div class="pp-tournament-list">
                    <div v-for="t in nextTournaments" :key="t.id" class="pp-tournament-card">
                        <div class="pp-tournament-info">
                            <h4 class="pp-tournament-name">{{ t.name }}</h4>
                            <p class="pp-tournament-details">{{ t.date }} · {{ t.buyIn }} · {{ t.structure }}</p>
                        </div>
                        <div class="pp-tournament-actions">
                            <IonChip v-if="t.spotsLeft > 0" class="pp-spots-chip px-3">
                                {{ $t('home.tournaments.spotsLeft', { count: t.spotsLeft }) }}
                            </IonChip>
                            <IonButton 
                                v-if="isAuthenticated"
                                size="small" 
                                :disabled="t.full" 
                                @click="register(t)"
                                :class="t.full ? 'pp-button-disabled' : 'pp-button-primary'"
                            >
                                {{ t.full ? $t('home.tournaments.full') : $t('home.tournaments.register') }}
                            </IonButton>
                            <IonButton 
                                v-else
                                size="small" 
                                @click="navigateTo('/login')"
                                class="pp-button-secondary"
                            >
                                {{ $t('events.register') }}
                            </IonButton>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Premium Recent Results -->
            <section class="pp-section pp-last-section">
                <div class="pp-section-header">
                    <h3 class="pp-section-title">
                        <IonIcon :icon="podiumOutline" />
                        {{ $t('home.results.title') }}
                    </h3>
                    <IonButton fill="clear" size="small" :routerLink="'/results'" class="pp-see-all-button">{{ $t('home.results.seeAll') }}</IonButton>
                </div>
                <div class="pp-results-list">
                    <div v-for="r in recentResults" :key="r.id" class="pp-result-card" @click="$router.push(`/results/${r.id}`)">
                        <div class="pp-result-info">
                            <h4 class="pp-result-position">#{{ r.place }} · {{ r.tournament }}</h4>
                            <p class="pp-result-details">{{ r.date }} · {{ $t('home.results.buyIn') }} {{ currency(r.buyIn) }} · {{ $t('home.results.cash') }} {{ currency(r.cash) }}</p>
                        </div>
                        <IonBadge :class="r.profit >= 0 ? 'pp-profit-badge' : 'pp-loss-badge'">
                            {{ r.profit >= 0 ? '+' : '' }}{{ currency(r.profit) }}
                        </IonBadge>
                    </div>
                </div>
            </section>

            <!-- Premium Club Popover -->
            <IonPopover trigger="club-select-trigger" :dismissOnSelect="true" class="pp-popover">
                <IonContent class="pp-popover-content">
                    <div class="pp-popover-items">
                        <div v-for="c in clubs" :key="c.id" class="pp-popover-item" @click="setActiveClub(c)">
                            <span class="pp-popover-text">{{ c.name }}</span>
                            <IonIcon v-if="activeClub?.id === c.id" :icon="checkmarkOutline" class="pp-popover-check" />
                        </div>
                    </div>
                </IonContent>
            </IonPopover>

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
import {
    calendarNumberOutline,
    calendarOutline,
    checkmarkOutline,
    chevronDownOutline,
    diamondOutline,
    fileTrayFullOutline,
    languageOutline,
    locationOutline,
    podiumOutline,
    refreshOutline,
    statsChartOutline,
    trendingUpOutline,
    trophyOutline,
} from 'ionicons/icons'
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useClubs } from '~/composables/usePokerAPI'
import avatarUrl from '@/assets/images/jmvdb.png'

// Language switching
const { t, locale, switchLanguage } = useI18n()

// Default to dark mode - premium experience
const isDark = ref(true)

const applyTheme = (dark: boolean) => {
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
    root.classList.add('pp-dark')
  } else {
    root.classList.remove('dark')
    root.classList.remove('pp-dark')
  }
  isDark.value = dark
}

const toggleTheme = () => {
  applyTheme(!isDark.value)
}

onMounted(() => {
  // Default to dark mode for premium experience
  applyTheme(true)
})

// Authentication
const { isAuthenticated, currentUser } = useAuth()

// Clubs
const { clubs, loading: clubsLoading } = useClubs()

// Player-centric defaults
const username = computed(() => {
  if (isAuthenticated.value && currentUser.value) {
    return currentUser.value.username
  }
  return 'Guest' // Fallback for guests
})

const activeClub = ref<any>(null)

const setActiveClub = (c: any) => { activeClub.value = c }

// Set first club as active when clubs are loaded
watch(clubs, (newClubs) => {
  if (newClubs.length > 0 && !activeClub.value) {
    activeClub.value = newClubs[0]
  }
}, { immediate: true })

// KPIs specific to the connected player
const kpis = ref({ itm: 34, roi: 18, cashes: 12 })

const nextTournaments = ref([
    { id: 't1', name: 'Tuesday Deepstack', date: 'Tue · 19:00', buyIn: '50€', structure: '20k/20m', spotsLeft: 8, full: false },
    { id: 't2', name: 'Weekend Freezeout', date: 'Fri · 20:00', buyIn: '70€', structure: '25k/25m', spotsLeft: 0, full: true },
    { id: 't3', name: 'Monthly Main', date: 'Sat · 18:00', buyIn: '150€', structure: '50k/30m', spotsLeft: 3, full: false },
])

const recentResults = ref([
    { id: 'r1', tournament: 'Tuesday Deepstack', date: 'Aug 05', place: 2, buyIn: 50, cash: 320, profit: 270 },
    { id: 'r2', tournament: 'Weekend Freezeout', date: 'Aug 02', place: 14, buyIn: 70, cash: 0, profit: -70 },
    { id: 'r3', tournament: 'Monthly Main', date: 'Jul 27', place: 6, buyIn: 150, cash: 420, profit: 270 },
])

const selectedRange = ref<'week' | 'month' | 'year'>('month')
const selectedRangeLabel = computed(() => {
  const ranges = {
    week: '7 days',
    month: '30 days', 
    year: '1 year'
  }
  return ranges[selectedRange.value]
})

const onRangeChange = (e: CustomEvent) => { selectedRange.value = e.detail.value }

const currency = (n: number) => { return `${n.toLocaleString('fr-BE', { maximumFractionDigits: 0 })}€` }

const handleRefresh = async (ev: CustomEvent) => {
    setTimeout(() => { (ev.target as any)?.complete?.() }, 700)
}

const refresh = () => { /* hook to your data reload */ }
const openProfile = () => { /* navigate to profile or open modal */ }
const register = (t: any) => { /* call registration flow for tournament t */ }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

.pp-page {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #18181a;
}

/* Header Styles */
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

.pp-sub-toolbar {
  --background: transparent;
  --border-color: transparent;
  padding: 0 4px;
}

.pp-club-button {
  --color: #54545f;
  --color-hover: #fee78a;
  --background-hover: rgba(254, 231, 138, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 500;
}

.pp-club-name {
  margin: 0 8px;
  font-size: 14px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Content Styles */
.pp-content {
  --background: #18181a;
}

.pp-section {
  padding: 16px;
  margin-bottom: 8px;
}

.pp-last-section {
  padding-bottom: 100px;
}

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

.pp-avatar-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(45deg, #64748b, #475569);
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.4;
  animation: pulse 2s ease-in-out infinite alternate;
}

.pp-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border: 2px solid #fee78a;
  box-shadow: 0 4px 16px rgba(254, 231, 138, 0.3);
}

.pp-avatar img {
  border-radius: 50%;
}

/* Guest Icon Container */
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

/* Action Cards */
.pp-actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.pp-action-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pp-action-card:hover {
  border-color: #64748b;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(100, 116, 139, 0.15);
}


.pp-action-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(71, 85, 105, 0.15));
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e2e8f0;
  font-size: 24px;
}

.pp-action-icon-trophy {
  background: linear-gradient(135deg, rgba(71, 85, 105, 0.25), rgba(100, 116, 139, 0.15));
}

.pp-action-content {
  flex: 1;
}

.pp-action-title {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.pp-action-subtitle {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
}

/* Card Styles */
.pp-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
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

.pp-segment {
  --background: rgba(84, 84, 95, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
}

.pp-segment-button {
  --color: #54545f;
  --color-checked: #18181a;
  --background-checked: #fee78a;
  font-size: 12px;
  font-weight: 500;
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

.pp-button-primary {
  --background: linear-gradient(135deg, #64748b, #475569);
  --color: white;
  font-weight: 600;
  font-size: 12px;
  border-radius: 8px;
}

.pp-button-disabled {
  --background: rgba(84, 84, 95, 0.3);
  --color: #54545f;
  font-weight: 500;
  font-size: 12px;
  border-radius: 8px;
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

/* Popover */
.pp-popover {
  --background: rgba(24, 24, 26, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.pp-popover-content {
  --background: #18181a;
}

.pp-popover-items {
  padding: 8px;
}

.pp-popover-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.pp-popover-item:hover {
  background: rgba(254, 231, 138, 0.1);
}

.pp-popover-text {
  color: #fee78a;
  font-weight: 500;
  font-size: 14px;
}

.pp-popover-check {
  color: #64748b;
  font-size: 16px;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
</style>