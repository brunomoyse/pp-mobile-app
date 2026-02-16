<template>
  <div class="pp-clock-display" :class="{ 'pp-clock-live': isLive }">
    <div class="pp-clock-header">
      <h3 class="pp-clock-title">
        <div v-if="isLive" class="pp-live-indicator"></div>
        {{ t('events.tournamentClock') }}
      </h3>
      <div class="pp-current-level-badge">
        {{ t('events.level') }} {{ currentLevel?.level || '-' }}
      </div>
    </div>

    <div class="pp-clock-body">
      <!-- Time Remaining -->
      <div class="pp-time-section">
        <div class="pp-time-value">{{ formattedTime }}</div>
        <div class="pp-time-label">
          {{ currentLevel?.isBreak ? t('events.breakTime') : t('events.timeRemaining') }}
        </div>
      </div>

      <!-- Current Blinds -->
      <div v-if="currentLevel && !currentLevel.isBreak" class="pp-blinds-section">
        <div class="pp-blinds-value">
          <span class="pp-small-blind">{{ currentLevel.smallBlind }}</span>
          <span class="pp-blinds-separator">/</span>
          <span class="pp-big-blind">{{ currentLevel.bigBlind }}</span>
        </div>
        <div class="pp-blinds-label">{{ t('events.smallBigBlind') }}</div>
        <div v-if="currentLevel.ante" class="pp-ante-value">
          {{ t('events.ante') }}: {{ currentLevel.ante }}
        </div>
      </div>

      <!-- Break Info -->
      <div v-else-if="currentLevel?.isBreak" class="pp-break-section">
        <div class="pp-break-text">{{ t('events.onBreak') }}</div>
      </div>
    </div>

    <!-- Next Level Info -->
    <div v-if="nextLevel" class="pp-clock-footer">
      <span class="pp-next-label">{{ t('events.nextLevel') }}:</span>
      <span v-if="nextLevel.isBreak" class="pp-next-break">
        {{ t('events.break') }}
      </span>
      <span v-else class="pp-next-blinds">
        {{ nextLevel.smallBlind }}/{{ nextLevel.bigBlind }}
        <span v-if="nextLevel.ante" class="pp-next-ante">
          ({{ t('events.ante') }}: {{ nextLevel.ante }})
        </span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDuration } from '~/utils/datetime'

const { t } = useI18n()

interface Level {
  level: number
  smallBlind: number
  bigBlind: number
  ante: number | null
  isBreak: boolean
}

const props = defineProps<{
  currentLevel: Level | null
  nextLevel?: Level | null
  timeRemaining: number
  isLive?: boolean
}>()

const formattedTime = computed(() => {
  return formatDuration(props.timeRemaining)
})
</script>

<style scoped>
.pp-clock-display {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.pp-clock-live {
  border-color: #ef4444;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

.pp-clock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pp-clock-title {
  color: #fee78a;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pp-live-indicator {
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-live 2s ease-in-out infinite;
}

@keyframes pulse-live {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(239, 68, 68, 0.7); }
  50% { opacity: 0.5; box-shadow: 0 0 16px rgba(239, 68, 68, 1); }
}

.pp-current-level-badge {
  background: linear-gradient(135deg, #64748b, #475569);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.pp-clock-live .pp-current-level-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.pp-clock-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.pp-time-section {
  text-align: center;
}

.pp-time-value {
  color: #ef4444;
  font-size: 36px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  margin-bottom: 4px;
}

.pp-time-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-blinds-section {
  text-align: center;
}

.pp-blinds-value {
  color: #fee78a;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pp-blinds-separator {
  color: #64748b;
  margin: 0 4px;
}

.pp-blinds-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.pp-ante-value {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

.pp-break-section {
  text-align: center;
  grid-column: 1 / -1;
}

.pp-break-text {
  color: #f59e0b;
  font-size: 24px;
  font-weight: 700;
}

.pp-clock-footer {
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
  font-size: 12px;
}

.pp-next-break {
  color: #f59e0b;
  font-weight: 600;
}

@media (max-width: 480px) {
  .pp-clock-body {
    grid-template-columns: 1fr;
  }

  .pp-time-value {
    font-size: 28px;
  }

  .pp-blinds-value {
    font-size: 24px;
  }
}
</style>
