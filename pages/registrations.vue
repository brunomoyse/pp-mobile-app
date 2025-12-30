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
                  :class="getStatusClass(registration.status)"
                  class="pp-status-badge"
                >
                  {{ t(`mySeats.status.${registration.status.toLowerCase().replace(' ', '_')}`) }}
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
                  <span class="pp-detail-text">{{ registration.table ? `Table ${registration.table} - Seat ${registration.seatNumber}` : t('mySeats.tableNotAssigned') }}</span>
                </div>
              </div>

              <div class="pp-detail-row">
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
                <!-- QR Code Button for upcoming/live registrations -->
                <IonButton
                  v-if="registration.status === 'upcoming' || registration.status === 'live'"
                  fill="clear"
                  size="small"
                  @click.stop="showQRCode(registration)"
                  class="pp-button-qr"
                >
                  <IonIcon :icon="qrCodeOutline" />
                </IonButton>

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

      <!-- QR Code Modal -->
      <QRCodeModal
        :isOpen="showQRModal"
        :registrationId="selectedRegistrationId"
        @close="showQRModal = false"
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
} from 'ionicons/icons'
import QRCodeModal from '@/components/QRCodeModal.vue'
import { ref } from 'vue'

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

// Show QR code for check-in
const showQRCode = (registration: any) => {
  selectedRegistrationId.value = registration.id
  showQRModal.value = true
}

const handleRefresh = async (ev: CustomEvent) => {
  setTimeout(() => { (ev.target as any)?.complete?.() }, 1000)
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
.pp-button-qr {
  --color: #fee78a;
}

/* Buttons and empty state are now in shared.css */
/* Empty text specific margin override */
.pp-empty-text {
  margin: 0 0 24px 0;
}
</style>