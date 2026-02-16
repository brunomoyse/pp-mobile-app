<template>
  <div class="pp-seating-card" :class="{ 'pp-seating-card--current': isCurrentUser }">
    <div class="pp-seating-header">
      <div class="pp-seating-info">
        <div class="pp-table-number">
          {{ t('events.table') }} {{ tableNumber }}
        </div>
        <div class="pp-seat-number">
          {{ t('events.seat') }} {{ seatNumber }}
        </div>
      </div>
      <div v-if="isCurrentUser" class="pp-current-badge">
        <IonIcon :icon="personOutline" />
        {{ t('seating.you') }}
      </div>
    </div>

    <div class="pp-seating-body">
      <div v-if="playerName" class="pp-player-info">
        <IonAvatar class="pp-player-avatar">
          <img
            :src="playerAvatar"
            :alt="playerName"
            @error="handleAvatarError"
          />
        </IonAvatar>
        <div class="pp-player-details">
          <div class="pp-player-name">{{ playerName }}</div>
          <div v-if="chipStack !== undefined" class="pp-chip-stack">
            {{ formatChips(chipStack) }} {{ t('seating.chips') }}
          </div>
        </div>
      </div>

      <div v-else class="pp-empty-seat">
        <IonIcon :icon="removeCircleOutline" class="pp-empty-icon" />
        <span class="pp-empty-text">{{ t('seating.empty') }}</span>
      </div>
    </div>

    <div v-if="showActions" class="pp-seating-footer">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonAvatar, IonIcon } from '@ionic/vue'
import { personOutline, removeCircleOutline } from 'ionicons/icons'
import { computed } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  tableNumber: number
  seatNumber: number
  playerName?: string
  playerAvatar?: string
  chipStack?: number
  isCurrentUser?: boolean
  showActions?: boolean
}>()

const formatChips = (chips: number) => {
  if (chips >= 1000000) {
    return `${(chips / 1000000).toFixed(1)}M`
  } else if (chips >= 1000) {
    return `${(chips / 1000).toFixed(1)}K`
  }
  return chips.toString()
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/assets/images/default-avatar.png'
}
</script>

<style scoped>
.pp-seating-card {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.08), rgba(71, 85, 105, 0.08));
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.pp-seating-card:hover {
  border-color: rgba(100, 116, 139, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.1);
}

.pp-seating-card--current {
  background: linear-gradient(135deg, rgba(254, 231, 138, 0.1), rgba(251, 191, 36, 0.05));
  border-color: rgba(254, 231, 138, 0.5);
}

.pp-seating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pp-seating-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pp-table-number {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
}

.pp-seat-number {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
}

.pp-current-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(254, 231, 138, 0.2);
  color: #fee78a;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-seating-body {
  min-height: 60px;
}

.pp-player-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pp-player-avatar {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(100, 116, 139, 0.3);
}

.pp-seating-card--current .pp-player-avatar {
  border-color: rgba(254, 231, 138, 0.5);
}

.pp-player-details {
  flex: 1;
}

.pp-player-name {
  color: #e2e8f0;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.pp-chip-stack {
  color: #22c55e;
  font-size: 13px;
  font-weight: 600;
}

.pp-empty-seat {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #64748b;
}

.pp-empty-icon {
  font-size: 24px;
}

.pp-empty-text {
  font-size: 14px;
  font-weight: 500;
}

.pp-seating-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(84, 84, 95, 0.2);
}
</style>
