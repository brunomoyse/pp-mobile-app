<template>
  <div class="pp-leaderboard-table">
    <!-- Table Header -->
    <div class="pp-leaderboard-header">
      <span class="pp-header-rank">{{ t('leaderboard.rank') }}</span>
      <span class="pp-header-player">{{ t('leaderboard.player') }}</span>
      <span class="pp-header-stat">{{ headerStatLabel }}</span>
    </div>

    <!-- Table Rows -->
    <div class="pp-leaderboard-rows">
      <div
        v-for="entry in entries"
        :key="entry.user.id"
        class="pp-leaderboard-row"
        :class="{ 'pp-leaderboard-row--current': entry.isCurrentUser }"
        @click="handleRowClick(entry)"
      >
        <!-- Rank -->
        <div class="pp-leaderboard-rank">
          <div v-if="entry.rank <= 3" class="pp-medal" :class="`pp-medal-${entry.rank}`">
            <IonIcon :icon="trophyOutline" />
          </div>
          <span v-else class="pp-rank-number">#{{ entry.rank }}</span>
        </div>

        <!-- Player Info -->
        <div class="pp-leaderboard-player">
          <IonAvatar class="pp-player-avatar">
            <img
              :src="entry.avatar"
              :alt="entry.user.username"
              @error="handleAvatarError"
            />
          </IonAvatar>
          <div class="pp-player-details">
            <div class="pp-player-name">
              {{ entry.user.firstName || entry.user.username }}
              <IonIcon v-if="entry.isCurrentUser" :icon="personOutline" class="pp-current-icon" />
            </div>
            <div class="pp-player-tournaments">
              {{ entry.totalTournaments }} {{ t('leaderboard.tournaments') }}
            </div>
          </div>
        </div>

        <!-- Stat Value -->
        <div class="pp-leaderboard-stat">
          <div class="pp-stat-value" :class="getStatClass(entry)">
            {{ formatStatValue(entry) }}
          </div>
          <div v-if="showSecondary" class="pp-stat-secondary">
            {{ formatSecondaryValue(entry) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="entries.length === 0" class="pp-empty-state">
      <IonIcon :icon="podiumOutline" class="pp-empty-icon" />
      <p class="pp-empty-text">{{ t('leaderboard.empty') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonAvatar, IonIcon } from '@ionic/vue'
import { trophyOutline, personOutline, podiumOutline } from 'ionicons/icons'
import { computed } from 'vue'
import { currency } from '~/utils/currency'

const { t } = useI18n()

interface User {
  id: string
  firstName?: string
  lastName?: string
  username: string
  email: string
}

interface LeaderboardEntry {
  user: User
  rank: number
  totalTournaments: number
  totalBuyIns: number
  totalWinnings: number
  netProfit: number
  totalItm: number
  itmPercentage: number
  roiPercentage: number
  averageFinish: number
  firstPlaces: number
  finalTables: number
  points: number
  avatar?: string
  isCurrentUser?: boolean
}

const props = defineProps<{
  entries: LeaderboardEntry[]
  statType?: 'points' | 'profit' | 'roi' | 'itm'
  showSecondary?: boolean
}>()

const emit = defineEmits<{
  'row-click': [entry: LeaderboardEntry]
}>()

const headerStatLabel = computed(() => {
  const statMap = {
    points: t('leaderboard.points'),
    profit: t('leaderboard.profit'),
    roi: t('leaderboard.roi'),
    itm: t('leaderboard.itm'),
  }
  return statMap[props.statType || 'points']
})

const formatStatValue = (entry: LeaderboardEntry) => {
  switch (props.statType) {
    case 'profit':
      return currency(entry.netProfit / 100)
    case 'roi':
      return `${entry.roiPercentage}%`
    case 'itm':
      return `${entry.itmPercentage}%`
    case 'points':
    default:
      return entry.points.toString()
  }
}

const formatSecondaryValue = (entry: LeaderboardEntry) => {
  switch (props.statType) {
    case 'profit':
      return `${entry.roiPercentage}% ROI`
    case 'roi':
      return `${entry.totalItm} ITM`
    case 'itm':
      return `${entry.firstPlaces} wins`
    case 'points':
    default:
      return `${entry.totalItm} ITM`
  }
}

const getStatClass = (entry: LeaderboardEntry) => {
  if (props.statType === 'profit') {
    return entry.netProfit >= 0 ? 'pp-stat-positive' : 'pp-stat-negative'
  }
  return ''
}

const handleRowClick = (entry: LeaderboardEntry) => {
  emit('row-click', entry)
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/assets/images/default-avatar.png'
}
</script>

<style scoped>
.pp-leaderboard-table {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  overflow: hidden;
}

.pp-leaderboard-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px;
  gap: 12px;
  padding: 16px;
  background: rgba(84, 84, 95, 0.1);
  border-bottom: 1px solid #54545f;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-leaderboard-rows {
  max-height: 600px;
  overflow-y: auto;
}

.pp-leaderboard-row {
  display: grid;
  grid-template-columns: 60px 1fr 120px;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(84, 84, 95, 0.1);
  cursor: pointer;
  transition: background 0.2s ease;
}

.pp-leaderboard-row:hover {
  background: rgba(100, 116, 139, 0.05);
}

.pp-leaderboard-row--current {
  background: rgba(254, 231, 138, 0.1);
  border-left: 3px solid #fee78a;
}

.pp-leaderboard-row:last-child {
  border-bottom: none;
}

.pp-leaderboard-rank {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pp-medal {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.pp-medal-1 {
  background: linear-gradient(135deg, #fee78a, #fbbf24);
  color: #18181a;
}

.pp-medal-2 {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  color: #18181a;
}

.pp-medal-3 {
  background: linear-gradient(135deg, #cd7f32, #a0522d);
  color: #18181a;
}

.pp-rank-number {
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
}

.pp-leaderboard-player {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pp-player-avatar {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(100, 116, 139, 0.3);
}

.pp-leaderboard-row--current .pp-player-avatar {
  border-color: rgba(254, 231, 138, 0.5);
}

.pp-player-details {
  flex: 1;
  min-width: 0;
}

.pp-player-name {
  color: #e2e8f0;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pp-current-icon {
  color: #fee78a;
  font-size: 14px;
}

.pp-player-tournaments {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
}

.pp-leaderboard-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
}

.pp-stat-value {
  color: #fee78a;
  font-size: 16px;
  font-weight: 700;
}

.pp-stat-positive {
  color: #22c55e;
}

.pp-stat-negative {
  color: #ef4444;
}

.pp-stat-secondary {
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
}

.pp-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.pp-empty-icon {
  font-size: 64px;
  color: #54545f;
  margin-bottom: 16px;
}

.pp-empty-text {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
}
</style>
