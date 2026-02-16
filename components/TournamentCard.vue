<template>
  <div class="pp-tournament-card" @click="handleClick">
    <!-- Tournament Header -->
    <div class="pp-tournament-card-header">
      <div class="pp-tournament-card-info">
        <h3 class="pp-tournament-card-title">{{ tournament.title }}</h3>
        <div class="pp-tournament-card-meta">
          <IonBadge :class="getStatusClass(tournament.status)" class="pp-status-badge">
            {{ t(`events.status.${tournament.status.toLowerCase()}`) }}
          </IonBadge>
          <span v-if="tournament.liveStatus" class="pp-live-status">
            {{ t(`events.status.${tournament.liveStatus.toLowerCase()}`) }}
          </span>
        </div>
      </div>
      <IonIcon :icon="chevronForwardOutline" class="pp-tournament-card-arrow" />
    </div>

    <!-- Tournament Details -->
    <div class="pp-tournament-card-details">
      <div class="pp-detail-item">
        <IonIcon :icon="calendarOutline" class="pp-detail-icon" />
        <span class="pp-detail-text">{{ formatDateTime(tournament.startTime, locale) }}</span>
      </div>

      <div class="pp-detail-item">
        <IonIcon :icon="cashOutline" class="pp-detail-icon" />
        <span class="pp-detail-text">{{ currencyCents(tournament.buyInCents) }}</span>
      </div>

      <div class="pp-detail-item">
        <IonIcon :icon="peopleOutline" class="pp-detail-icon" />
        <span class="pp-detail-text">
          {{ registeredCount }}/{{ tournament.seatCap || '∞' }} {{ t('events.players') }}
        </span>
      </div>
    </div>

    <!-- Optional Footer Slot -->
    <div v-if="$slots.footer" class="pp-tournament-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonBadge, IonIcon } from '@ionic/vue'
import {
  calendarOutline,
  cashOutline,
  peopleOutline,
  chevronForwardOutline,
} from 'ionicons/icons'
import { computed } from 'vue'
import { formatDateTime } from '~/utils/datetime'
import { currencyCents } from '~/utils/currency'

const { t, locale } = useI18n()

interface Tournament {
  id: string
  title: string
  startTime: string
  buyInCents: number
  seatCap: number | null
  status: string
  liveStatus?: string
  registrations?: any[]
}

const props = defineProps<{
  tournament: Tournament
}>()

const emit = defineEmits<{
  'click': [tournament: Tournament]
}>()

const registeredCount = computed(() => {
  return props.tournament.registrations?.length || 0
})

const getStatusClass = (status: string) => {
  switch (status.toUpperCase()) {
    case 'UPCOMING':
    case 'REGISTRATION_OPEN':
      return 'pp-status-upcoming'
    case 'IN_PROGRESS':
    case 'LIVE':
      return 'pp-status-live'
    case 'COMPLETED':
    case 'FINISHED':
      return 'pp-status-completed'
    default:
      return 'pp-status-default'
  }
}

const handleClick = () => {
  emit('click', props.tournament)
}
</script>

<style scoped>
.pp-tournament-card {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pp-tournament-card:hover {
  border-color: #64748b;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(100, 116, 139, 0.15);
}

.pp-tournament-card:active {
  transform: translateY(0);
}

.pp-tournament-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.pp-tournament-card-info {
  flex: 1;
}

.pp-tournament-card-title {
  color: #fee78a;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.pp-tournament-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pp-status-badge {
  font-size: 11px;
  font-weight: 600;
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

.pp-live-status {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

.pp-tournament-card-arrow {
  color: #64748b;
  font-size: 20px;
  flex-shrink: 0;
  margin-left: 8px;
}

.pp-tournament-card-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pp-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pp-detail-icon {
  color: #64748b;
  font-size: 16px;
  flex-shrink: 0;
}

.pp-detail-text {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 400;
}

.pp-tournament-card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(84, 84, 95, 0.2);
}
</style>
