<template>
  <div class="pp-tournament-sections">
    <!-- Section Tabs -->
    <IonSegment :value="activeSection" @ionChange="onSectionChange" class="pp-sections-tabs">
      <IonSegmentButton value="overview" class="pp-section-tab">
        <IonLabel>{{ t('tournament.sections.overview') }}</IonLabel>
      </IonSegmentButton>
      <IonSegmentButton value="structure" class="pp-section-tab">
        <IonLabel>{{ t('tournament.sections.structure') }}</IonLabel>
      </IonSegmentButton>
      <IonSegmentButton value="prizes" class="pp-section-tab">
        <IonLabel>{{ t('tournament.sections.prizes') }}</IonLabel>
      </IonSegmentButton>
    </IonSegment>

    <!-- Section Content -->
    <div class="pp-sections-content">
      <!-- Overview Section -->
      <div v-if="activeSection === 'overview'" class="pp-section">
        <slot name="overview">
          <div class="pp-overview-grid">
            <div class="pp-overview-item">
              <div class="pp-overview-label">{{ t('tournament.buyIn') }}</div>
              <div class="pp-overview-value">{{ currencyCents(tournament.buyInCents) }}</div>
            </div>

            <div class="pp-overview-item">
              <div class="pp-overview-label">{{ t('tournament.startTime') }}</div>
              <div class="pp-overview-value">{{ formatDateTime(tournament.startTime, locale) }}</div>
            </div>

            <div v-if="tournament.seatCap" class="pp-overview-item">
              <div class="pp-overview-label">{{ t('tournament.capacity') }}</div>
              <div class="pp-overview-value">
                {{ tournament.registrations?.length || 0 }}/{{ tournament.seatCap }}
              </div>
            </div>

            <div class="pp-overview-item">
              <div class="pp-overview-label">{{ t('tournament.status') }}</div>
              <div class="pp-overview-value">
                <IonBadge :class="getStatusClass(tournament.status)">
                  {{ t(`events.status.${tournament.status.toLowerCase()}`) }}
                </IonBadge>
              </div>
            </div>
          </div>

          <div v-if="tournament.description" class="pp-description">
            <h4 class="pp-description-title">{{ t('tournament.description') }}</h4>
            <p class="pp-description-text">{{ tournament.description }}</p>
          </div>
        </slot>
      </div>

      <!-- Structure Section -->
      <div v-if="activeSection === 'structure'" class="pp-section">
        <slot name="structure">
          <div v-if="structure && structure.length > 0" class="pp-structure-table">
            <div class="pp-structure-header">
              <span>{{ t('tournament.structure.level') }}</span>
              <span>{{ t('tournament.structure.sb') }}</span>
              <span>{{ t('tournament.structure.bb') }}</span>
              <span>{{ t('tournament.structure.ante') }}</span>
              <span>{{ t('tournament.structure.duration') }}</span>
            </div>

            <div class="pp-structure-rows">
              <div
                v-for="level in structure"
                :key="level.levelNumber"
                class="pp-structure-row"
                :class="{ 'pp-structure-row--break': level.isBreak }"
              >
                <span class="pp-level">{{ level.levelNumber }}</span>
                <span class="pp-sb">{{ level.isBreak ? '-' : level.smallBlind }}</span>
                <span class="pp-bb">{{ level.isBreak ? '-' : level.bigBlind }}</span>
                <span class="pp-ante">{{ level.ante || '-' }}</span>
                <span class="pp-duration">
                  {{ level.isBreak ? level.breakDurationMinutes : level.durationMinutes }} min
                </span>
              </div>
            </div>
          </div>

          <div v-else class="pp-empty-message">
            {{ t('tournament.structure.empty') }}
          </div>
        </slot>
      </div>

      <!-- Prizes Section -->
      <div v-if="activeSection === 'prizes'" class="pp-section">
        <slot name="prizes">
          <div v-if="payout" class="pp-prizes-list">
            <div class="pp-prize-summary">
              <div class="pp-prize-total">
                <span class="pp-prize-total-label">{{ t('tournament.prizes.total') }}</span>
                <span class="pp-prize-total-value">{{ currencyCents(payout.totalPrizePool) }}</span>
              </div>
              <div class="pp-prize-players">
                {{ t('tournament.prizes.paying') }} {{ payout.positions.length }} {{ t('tournament.prizes.positions') }}
              </div>
            </div>

            <div class="pp-prize-positions">
              <div
                v-for="position in payout.positions"
                :key="position.position"
                class="pp-prize-position"
              >
                <span class="pp-prize-rank">#{{ position.position }}</span>
                <span class="pp-prize-percentage">{{ position.percentage }}%</span>
                <span class="pp-prize-amount">{{ currencyCents(position.amountCents) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="pp-empty-message">
            {{ t('tournament.prizes.empty') }}
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonSegment, IonSegmentButton, IonLabel, IonBadge } from '@ionic/vue'
import { ref } from 'vue'
import { formatDateTime } from '~/utils/datetime'
import { currencyCents } from '~/utils/currency'

const { t, locale } = useI18n()

interface TournamentStructure {
  id: string
  levelNumber: number
  smallBlind: number
  bigBlind: number
  ante: number | null
  durationMinutes: number
  isBreak: boolean
  breakDurationMinutes: number | null
}

interface PayoutPosition {
  position: number
  percentage: number
  amountCents: number
}

interface Payout {
  totalPrizePool: number
  positions: PayoutPosition[]
}

interface Tournament {
  id: string
  title: string
  description?: string
  startTime: string
  buyInCents: number
  seatCap: number | null
  status: string
  registrations?: any[]
}

const props = withDefaults(
  defineProps<{
    tournament: Tournament
    structure?: TournamentStructure[]
    payout?: Payout
    defaultSection?: 'overview' | 'structure' | 'prizes'
  }>(),
  {
    defaultSection: 'overview',
  }
)

const activeSection = ref(props.defaultSection)

const onSectionChange = (event: CustomEvent) => {
  activeSection.value = event.detail.value
}

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
</script>

<style scoped>
.pp-tournament-sections {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  overflow: hidden;
}

.pp-sections-tabs {
  --background: rgba(84, 84, 95, 0.1);
  border-bottom: 1px solid #54545f;
  padding: 8px;
}

.pp-section-tab {
  --indicator-color: #fee78a;
  --color-checked: #fee78a;
  --color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  text-transform: none;
}

.pp-sections-content {
  padding: 20px;
}

.pp-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Overview Section */
.pp-overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.pp-overview-item {
  background: rgba(84, 84, 95, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.pp-overview-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.pp-overview-value {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
}

.pp-description {
  background: rgba(84, 84, 95, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.pp-description-title {
  color: #fee78a;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.pp-description-text {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

/* Structure Section */
.pp-structure-table {
  font-size: 13px;
}

.pp-structure-header {
  display: grid;
  grid-template-columns: 50px 70px 70px 60px 1fr;
  gap: 8px;
  padding: 12px;
  background: rgba(84, 84, 95, 0.1);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.pp-structure-rows {
  max-height: 400px;
  overflow-y: auto;
}

.pp-structure-row {
  display: grid;
  grid-template-columns: 50px 70px 70px 60px 1fr;
  gap: 8px;
  padding: 12px;
  background: rgba(100, 116, 139, 0.05);
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background 0.2s ease;
}

.pp-structure-row:hover {
  background: rgba(100, 116, 139, 0.1);
}

.pp-structure-row--break {
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid #f59e0b;
}

.pp-level {
  color: #fee78a;
  font-weight: 600;
}

.pp-sb,
.pp-bb {
  color: #e2e8f0;
  font-weight: 500;
}

.pp-ante,
.pp-duration {
  color: #94a3b8;
}

/* Prizes Section */
.pp-prizes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pp-prize-summary {
  background: linear-gradient(135deg, rgba(254, 231, 138, 0.1), rgba(251, 191, 36, 0.05));
  border: 1px solid rgba(254, 231, 138, 0.3);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.pp-prize-total {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.pp-prize-total-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-prize-total-value {
  color: #fee78a;
  font-size: 32px;
  font-weight: 700;
}

.pp-prize-players {
  color: #64748b;
  font-size: 12px;
}

.pp-prize-positions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pp-prize-position {
  display: grid;
  grid-template-columns: 60px 80px 1fr;
  gap: 12px;
  padding: 12px;
  background: rgba(84, 84, 95, 0.1);
  border-radius: 8px;
  align-items: center;
}

.pp-prize-rank {
  color: #fee78a;
  font-size: 16px;
  font-weight: 700;
}

.pp-prize-percentage {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
}

.pp-prize-amount {
  color: #22c55e;
  font-size: 16px;
  font-weight: 700;
  text-align: right;
}

/* Empty States */
.pp-empty-message {
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  padding: 32px;
}

/* Status Badges */
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

@media (max-width: 480px) {
  .pp-overview-grid {
    grid-template-columns: 1fr;
  }

  .pp-structure-header,
  .pp-structure-row {
    grid-template-columns: 40px 60px 60px 50px 1fr;
    font-size: 11px;
  }

  .pp-prize-position {
    grid-template-columns: 50px 70px 1fr;
  }
}
</style>
