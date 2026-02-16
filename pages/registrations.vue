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
      <IonToolbar class="pp-sub-toolbar">
        <ClubSelector />
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true" class="pp-content">
      <!-- Pull to refresh -->
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent :pulling-text="t('common.pullToRefresh')" refreshing-spinner="dots" />
      </IonRefresher>

      <!-- Loading State -->
      <div v-if="isLoading" class="pp-loading-container">
        <IonSpinner name="crescent" />
        <p>{{ t('mySeats.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="pp-error-container">
        <IonIcon :icon="alertCircleOutline" size="large" />
        <p>{{ t('mySeats.error') }}</p>
        <IonButton @click="refetchRegistrations">{{ t('common.retry') }}</IonButton>
      </div>

      <!-- Content -->
      <div v-else>

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
                  :class="getRegistrationStatusClass(registration.registrationStatus)"
                  class="pp-status-badge"
                >
                  {{ t(`mySeats.registrationStatus.${registration.registrationStatus}`) }}
                </IonBadge>
              </div>
            </div>

            <!-- Registration Details -->
            <div class="pp-registration-details">
              <div class="pp-detail-row">
                <div class="pp-detail-item">
                  <IonIcon :icon="calendarOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ formatDate(registration.startTime, locale) }}</span>
                </div>
                <div class="pp-detail-item">
                  <IonIcon :icon="timeOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ formatTime(registration.startTime, locale) }}</span>
                </div>
              </div>
              
              <div class="pp-detail-row">
                <div class="pp-detail-item">
                  <IonIcon :icon="cashOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ t('mySeats.buyIn') }} {{ registration.buyIn }}</span>
                </div>
                <div class="pp-detail-item">
                  <IonIcon :icon="locationOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ registration.table ? `${t('events.table')} ${registration.table} - ${t('events.seat')} ${registration.seatNumber}` : t('mySeats.tableNotAssigned') }}</span>
                </div>
              </div>

              <div class="pp-detail-row">
                <div class="pp-detail-item" v-if="registration.position">
                  <IonIcon :icon="trophyOutline" class="pp-detail-icon" />
                  <span class="pp-detail-text">{{ t('mySeats.position') }} #{{ registration.position }}</span>
                </div>
                <div class="pp-detail-item" v-if="registration.registrationStatus === 'WAITLISTED' && registration.waitlistPosition">
                  <IonIcon :icon="timeOutline" class="pp-detail-icon pp-detail-icon--waitlist" />
                  <span class="pp-detail-text pp-detail-text--waitlist">{{ t('events.waitlistPosition', { position: registration.waitlistPosition }) }}</span>
                </div>
              </div>

              <!-- Registration Date -->
              <div class="pp-registration-date">
                <IonIcon :icon="checkmarkCircleOutline" class="pp-registration-date-icon" />
                <span class="pp-registration-date-text">
                  {{ t('mySeats.registeredOn') }} {{ formatDateTime(registration.registeredAt, locale) }}
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
                <!-- QR Code Button for upcoming/live registrations -->
                <IonButton
                  v-if="registration.status === 'upcoming' || registration.status === 'live'"
                  fill="clear"
                  size="small"
                  @click.stop="showQRCode(registration)"
                  class="pp-action-button--qr"
                >
                  <IonIcon :icon="qrCodeOutline" />
                </IonButton>

                <IonButton
                  fill="clear"
                  size="small"
                  @click.stop="shareRegistration(registration)"
                  class="pp-action-button pp-action-button--secondary"
                >
                  <IonIcon :icon="shareOutline" />
                </IonButton>

                <IonButton
                  v-if="registration.status === 'upcoming' && canCancel(registration) && (registration.registrationStatus === 'REGISTERED' || registration.registrationStatus === 'WAITLISTED')"
                  @click.stop="cancelRegistration(registration)"
                  class="pp-action-button pp-action-button--warning"
                  size="small"
                >
                  {{ t('mySeats.cancel') }}
                </IonButton>

                <IonButton
                  v-else-if="registration.status === 'live'"
                  @click.stop="viewLive(registration)"
                  class="pp-action-button pp-action-button--danger"
                  size="small"
                >
                  {{ t('mySeats.viewLive') }}
                </IonButton>

                <IonButton
                  v-else-if="registration.status === 'completed'"
                  @click.stop="viewResult(registration)"
                  class="pp-action-button pp-action-button--secondary"
                  size="small"
                >
                  {{ t('mySeats.viewResult') }}
                </IonButton>

                <IonButton
                  v-if="registration.status === 'upcoming'"
                  @click.stop="modifyRegistration(registration)"
                  class="pp-action-button pp-action-button--primary"
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
          <IonButton @click="$router.push('/tournaments')" class="pp-action-button pp-action-button--primary">
            {{ t('mySeats.empty.browseEvents') }}
          </IonButton>
        </div>
      </section>

      </div><!-- End v-else content wrapper -->

      <!-- QR Code Scanner -->
      <QRCodeScanner
        :isOpen="showQRModal"
        @close="showQRModal = false"
        @scanned="handleQRScanned"
      />
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
  IonSpinner,
  alertController,
} from '@ionic/vue'
import ClubSelector from '@/components/ClubSelector.vue'
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
  qrCodeOutline,
  alertCircleOutline,
} from 'ionicons/icons'
import QRCodeScanner from '@/components/QRCodeScanner.vue'
import { formatDate, formatTime, formatDateTime } from '~/utils/datetime'
import { ref } from 'vue'

interface DisplayRegistration {
  id: string
  tournamentId: string
  tournamentName: string
  type: string
  club: string
  status: string
  registrationStatus: string
  startTime: string
  buyIn: string
  table: string | null
  seatNumber: number | null
  position: number | null
  registeredAt: string
  canCancelUntil: string
  waitlistPosition: number | null
}

definePageMeta({
    middleware: 'auth'
})

// Use custom i18n composable
const { t, locale } = useI18n()

// Reactive data
const showFilters = ref(false)
const selectedCategory = ref<'upcoming' | 'live' | 'completed'>('upcoming')
const selectedFilters = ref<string[]>([])

// QR Modal state
const showQRModal = ref(false)
const selectedRegistrationId = ref('')

// Filter options
const filters = [
  { key: 'canCancel', label: 'Cancelable' },
  { key: 'lateReg', label: 'Late Registration' },
  { key: 'highStakes', label: 'High Stakes' },
  { key: 'deepstack', label: 'Deepstack' },
  { key: 'turbo', label: 'Turbo' },
]

// Fetch user's registrations from API
const { data: registrationsResponse, status: registrationsStatus, error: registrationsError, refresh: refetchRegistrations } = useLazyAsyncData(
  'my-registrations',
  () => GqlGetMyRegistrations(),
  {
    immediate: true,
  }
)

// Transform to DisplayRegistration format
const registrations = computed<DisplayRegistration[]>(() => {
  const regs = registrationsResponse.value?.myTournamentRegistrations || []

  return regs.map(reg => {
    // Determine status category based on tournament live status
    let statusCategory = 'upcoming'
    if (reg.tournament?.liveStatus) {
      const liveStatus = reg.tournament.liveStatus.toLowerCase()
      if (liveStatus === 'in_progress' || liveStatus === 'late_registration' || liveStatus === 'break' || liveStatus === 'final_table') {
        statusCategory = 'live'
      } else if (liveStatus === 'finished') {
        statusCategory = 'completed'
      }
    } else if (reg.tournament?.status === 'COMPLETED' || reg.tournament?.status === 'FINISHED') {
      statusCategory = 'completed'
    }

    return {
      id: reg.id,
      tournamentId: reg.tournamentId,
      tournamentName: reg.tournament?.title || 'Unknown Tournament',
      type: statusCategory,
      club: reg.tournament?.club?.name || 'Unknown Club',
      status: statusCategory,
      registrationStatus: reg.status || 'REGISTERED',
      startTime: reg.tournament?.startTime || '',
      buyIn: reg.tournament?.buyInCents
        ? `€${(reg.tournament.buyInCents / 100).toFixed(2)}`
        : '€0.00',
      table: null, // TODO: Fetch from seating when available
      seatNumber: null, // TODO: Fetch from seating when available
      position: null, // TODO: Fetch from results when available
      registeredAt: reg.registrationTime,
      canCancelUntil: reg.tournament?.startTime || '', // Can cancel until start
      waitlistPosition: reg.waitlistPosition ?? null,
    }
  })
})

// Loading and error states
const isLoading = computed(() => registrationsStatus.value === 'pending')
const hasError = computed(() => !!registrationsError.value)

// Filter registrations by category
const filteredRegistrations = computed(() => {
  return registrations.value.filter(reg => {
    // Filter by selected category
    if (selectedCategory.value !== reg.status) return false

    // Filter by selected filters
    if (selectedFilters.value.length > 0) {
      // TODO: Implement filter logic when filter properties are available
    }

    return true
  })
})

// Stats computed properties
const registeredCount = computed(() => registrations.value.length)

const totalInvestment = computed(() => {
  return registrations.value.reduce((total, reg) => {
    const amount = parseFloat(reg.buyIn.replace('€', '').replace(',', '.'))
    return total + amount
  }, 0).toFixed(2)
})

const upcomingCount = computed(() => {
  return registrations.value.filter(reg => reg.status === 'upcoming').length
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

const getRegistrationStatusClass = (status: string) => {
  switch(status) {
    case 'REGISTERED': return 'pp-status-upcoming'
    case 'CHECKED_IN': return 'pp-status-upcoming'
    case 'SEATED': return 'pp-status-live'
    case 'BUSTED': return 'pp-status-completed'
    case 'WAITLISTED': return 'pp-status-waitlisted'
    case 'CANCELLED': return 'pp-status-completed'
    case 'NO_SHOW': return 'pp-status-completed'
    default: return 'pp-status-default'
  }
}

const canCancel = (registration: DisplayRegistration) => {
  return new Date() < new Date(registration.canCancelUntil)
}

// Open QR scanner for check-in
const showQRCode = (registration: DisplayRegistration) => {
  selectedRegistrationId.value = registration.id
  showQRModal.value = true
}

// Handle scanned QR code
const handleQRScanned = async (code: string) => {
  console.log('Scanned QR code:', code)
  // TODO: Call GqlCheckInRegistration mutation with scanned code
  const alert = await alertController.create({
    header: t('checkIn.success.title'),
    message: t('checkIn.success.message', { code }),
    buttons: [t('common.ok')],
  })
  await alert.present()
}

const handleRefresh = async (ev: CustomEvent) => {
  await refetchRegistrations()
  ;(ev.target as HTMLIonRefresherElement)?.complete?.()
}

// Share registration
const shareRegistration = async (registration: DisplayRegistration) => {
  const text = t('mySeats.shareMessage', { name: registration.tournamentName })
  if (navigator.share) {
    await navigator.share({ text })
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    const alert = await alertController.create({
      header: t('common.copied'),
      message: text,
      buttons: [t('common.ok')],
    })
    await alert.present()
  }
}

// Cancel registration
const authStore = useAuthStore()
const cancelRegistration = async (registration: DisplayRegistration) => {
  const alert = await alertController.create({
    header: t('mySeats.cancelConfirmTitle'),
    message: t('mySeats.cancelConfirmMessage', { name: registration.tournamentName }),
    buttons: [
      { text: t('common.no'), role: 'cancel' },
      {
        text: t('common.yes'),
        role: 'destructive',
        handler: async () => {
          try {
            await GqlCancelRegistration({
              input: {
                tournamentId: registration.tournamentId,
                userId: authStore.currentUser?.id,
              },
            })
            await refetchRegistrations()
          } catch (err) {
            console.error('Failed to cancel registration:', err)
          }
        },
      },
    ],
  })
  await alert.present()
}

// Modify registration (not yet available)
const modifyRegistration = async (_registration: DisplayRegistration) => {
  const alert = await alertController.create({
    header: t('mySeats.modify'),
    message: t('common.notYetAvailable'),
    buttons: [t('common.ok')],
  })
  await alert.present()
}

// View live tournament
const viewLive = (registration: DisplayRegistration) => {
  navigateTo(`/tournament/${registration.tournamentId}`)
}

// View tournament result
const viewResult = (registration: DisplayRegistration) => {
  navigateTo(`/tournament/${registration.tournamentId}`)
}
</script>

<style scoped>
/* Registrations page specific styles */

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

/* Stats styling is inherited from shared.css */

/* Filters - registrations specific */
.pp-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Segment button - registrations specific font size */
.pp-segment-button {
  font-size: 14px;
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

/* Tournament type badges are now in shared.css */

.pp-registration-club {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
}

/* Status badges are now in shared.css */

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

/* QR Button styling */
.pp-action-button--qr {
  --color: #fee78a;
}

/* Waitlisted status */
.pp-status-waitlisted {
  --background: rgba(245, 158, 11, 0.2);
  --color: #f59e0b;
}

/* Waitlist detail styling */
.pp-detail-icon--waitlist {
  color: #f59e0b;
}

.pp-detail-text--waitlist {
  color: #f59e0b;
  font-weight: 500;
}

/* Buttons and empty state are now in shared.css */
/* Empty text specific margin override */
.pp-empty-text {
  margin: 0 0 24px 0;
}
</style>