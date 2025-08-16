<template>
  <IonPage class="pp-page">
    <!-- Header -->
    <IonHeader :translucent="true" class="pp-header">
      <IonToolbar class="pp-toolbar">
        <IonButtons slot="start">
          <IonButton @click="goBack" class="pp-header-button">
            <IonIcon :icon="arrowBackOutline" />
          </IonButton>
        </IonButtons>
        <IonTitle class="pp-title">Friends</IonTitle>
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

      <!-- Search and Filters -->
      <section class="pp-section">
        <div class="pp-search-container">
          <IonSearchbar
            v-model="searchQuery"
            placeholder="Search players..."
            class="pp-searchbar"
            show-clear-button="focus"
            @ionInput="filterPlayers"
          />
        </div>
        
        <!-- Filter Pills -->
        <div v-if="showFilters" class="pp-filters">
          <IonChip 
            :class="selectedClubFilter === 'all' ? 'pp-chip-active' : 'pp-chip-inactive'"
            @click="filterByClub('all')"
          >
            <IonLabel>All Clubs</IonLabel>
          </IonChip>
          <IonChip 
            v-for="club in clubs" 
            :key="club"
            :class="selectedClubFilter === club ? 'pp-chip-active' : 'pp-chip-inactive'"
            @click="filterByClub(club)"
          >
            <IonLabel>{{ club }}</IonLabel>
          </IonChip>
        </div>
      </section>

      <!-- Friends Categories -->
      <section class="pp-section">
        <IonSegment v-model="selectedCategory" @ionChange="onCategoryChange" class="pp-segment">
          <IonSegmentButton value="following" class="pp-segment-button">
            <IonLabel>Following ({{ followingList.length }})</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="discover" class="pp-segment-button">
            <IonLabel>Discover</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </section>

      <!-- Players List -->
      <section class="pp-section">
        <div class="pp-players-list" v-if="filteredPlayers.length > 0">
          <div 
            v-for="player in filteredPlayers" 
            :key="player.id"
            class="pp-player-card"
          >
            <div class="pp-player-info">
              <IonAvatar class="pp-player-avatar">
                <img :src="player.avatar" :alt="player.username" />
              </IonAvatar>
              <div class="pp-player-details">
                <div class="pp-player-header">
                  <h3 class="pp-player-username">{{ player.username }}</h3>
                  <div class="pp-player-badges">
                    <IonIcon v-if="player.verified" :icon="checkmarkCircleOutline" class="pp-verified-icon" />
                    <div v-if="player.vipLevel" class="pp-vip-badge">
                      <IonIcon :icon="starOutline" />
                      <span>VIP {{ player.vipLevel }}</span>
                    </div>
                  </div>
                </div>
                <div class="pp-player-meta">
                  <span class="pp-player-club">{{ player.club }}</span>
                  <span class="pp-player-separator">•</span>
                  <span class="pp-player-stats">{{ player.totalWins }} wins</span>
                  <span class="pp-player-separator">•</span>
                  <span class="pp-player-winnings">{{ formatCurrency(player.totalWinnings) }}</span>
                </div>
                <div class="pp-player-achievements" v-if="player.recentAchievement">
                  <IonIcon :icon="trophyOutline" class="pp-achievement-icon" />
                  <span class="pp-achievement-text">{{ player.recentAchievement }}</span>
                </div>
              </div>
            </div>
            
            <div class="pp-player-actions">
              <IonButton 
                v-if="!isFollowing(player.id)"
                @click="followPlayer(player.id)"
                class="pp-follow-button"
                fill="solid"
                size="small"
              >
                <IonIcon :icon="personAddOutline" slot="start" />
                Follow
              </IonButton>
              <IonButton 
                v-else
                @click="unfollowPlayer(player.id)"
                class="pp-unfollow-button"
                fill="outline"
                size="small"
              >
                <IonIcon :icon="personRemoveOutline" slot="start" />
                Following
              </IonButton>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="pp-empty-state">
          <IonIcon 
            :icon="selectedCategory === 'following' ? peopleOutline : searchOutline" 
            class="pp-empty-icon" 
          />
          <h3 class="pp-empty-title">
            {{ selectedCategory === 'following' ? 'No Friends Yet' : 'No Players Found' }}
          </h3>
          <p class="pp-empty-description">
            {{ selectedCategory === 'following' 
              ? 'Start following other players to see them here' 
              : 'Try adjusting your search or filter criteria' 
            }}
          </p>
        </div>
      </section>
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
  IonSearchbar,
  IonChip,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonAvatar,
  IonBadge,
} from '@ionic/vue'
import ClubSelector from '@/components/ClubSelector.vue'
import { useClubStore } from '~/stores/useClubStore'
import {
  arrowBackOutline,
  optionsOutline,
  checkmarkCircleOutline,
  starOutline,
  trophyOutline,
  personAddOutline,
  personRemoveOutline,
  peopleOutline,
  searchOutline,
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useClubs } from '~/composables/usePokerAPI'

definePageMeta({
    middleware: 'auth'
})

// Use custom i18n composable
const { t } = useI18n()

// Reactive data
const showFilters = ref(false)
const searchQuery = ref('')
const clubStore = useClubStore()
const selectedClubFilter = ref('all')
const selectedCategory = ref('discover')
const followingIds = ref<number[]>([2, 5, 7])

// Dynamic clubs
const { clubs: clubsData } = useClubs()
const clubs = computed(() => clubsData.value.map(club => club.name))

// Players data
const allPlayers = ref([
  {
    id: 1,
    username: 'ElFish',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    club: 'Poker Palace',
    verified: true,
    vipLevel: 2,
    totalWins: 34,
    totalWinnings: 8500,
    recentAchievement: 'Won Sunday Million Qualifier',
  },
  {
    id: 2,
    username: 'CardShark88',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b72a2fc9?w=150&h=150&fit=crop&crop=face',
    club: 'Royal Flush Club',
    verified: false,
    vipLevel: 1,
    totalWins: 28,
    totalWinnings: 6200,
    recentAchievement: 'First place in Deep Stack',
  },
  {
    id: 3,
    username: 'AllInAnna',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    club: 'Diamond Casino',
    verified: true,
    vipLevel: 3,
    totalWins: 56,
    totalWinnings: 15200,
    recentAchievement: 'Tournament Series Champion',
  },
  {
    id: 4,
    username: 'BluffMaster',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    club: 'Golden Cards',
    verified: false,
    vipLevel: 0,
    totalWins: 12,
    totalWinnings: 3400,
    recentAchievement: null,
  },
  {
    id: 5,
    username: 'RiverRat',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    club: 'Ace High Society',
    verified: true,
    vipLevel: 2,
    totalWins: 41,
    totalWinnings: 9800,
    recentAchievement: 'High Roller Winner',
  },
  {
    id: 6,
    username: 'FoldQueen',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    club: 'Poker Palace',
    verified: false,
    vipLevel: 1,
    totalWins: 19,
    totalWinnings: 4700,
    recentAchievement: 'Turbo Champion',
  },
  {
    id: 7,
    username: 'ChipLeader',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    club: 'Royal Flush Club',
    verified: true,
    vipLevel: 3,
    totalWins: 63,
    totalWinnings: 18900,
    recentAchievement: 'Monthly Leaderboard #1',
  },
  {
    id: 8,
    username: 'TiltControl',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    club: 'Diamond Casino',
    verified: false,
    vipLevel: 0,
    totalWins: 8,
    totalWinnings: 2100,
    recentAchievement: null,
  },
])

// Following list computed from IDs
const followingList = computed(() => 
  allPlayers.value.filter(player => followingIds.value.includes(player.id))
)

// Filtered players based on search, club, and category
const filteredPlayers = computed(() => {
  let players = selectedCategory.value === 'following' 
    ? followingList.value 
    : allPlayers.value

  // Filter by club
  if (selectedClubFilter.value !== 'all') {
    players = players.filter(player => player.club === selectedClubFilter.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    players = players.filter(player => 
      player.username.toLowerCase().includes(query) ||
      player.club.toLowerCase().includes(query)
    )
  }

  return players
})

// Methods
const handleRefresh = async (ev: CustomEvent) => {
  setTimeout(() => { (ev.target as any)?.complete?.() }, 1000)
}

const goBack = () => {
  history.back()
}

const filterPlayers = () => {
  // This is handled by the computed property
}

const filterByClub = (club: string) => {
  selectedClubFilter.value = club
}

const onCategoryChange = (event: any) => {
  selectedCategory.value = event.detail.value
}

const isFollowing = (playerId: number) => {
  return followingIds.value.includes(playerId)
}

const followPlayer = (playerId: number) => {
  if (!followingIds.value.includes(playerId)) {
    followingIds.value.push(playerId)
  }
}

const unfollowPlayer = (playerId: number) => {
  const index = followingIds.value.indexOf(playerId)
  if (index > -1) {
    followingIds.value.splice(index, 1)
  }
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString('fr-BE', { maximumFractionDigits: 0 })}€`
}
</script>

<style scoped>
.pp-page {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #18181a;
}

/* Header */
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

.pp-sub-toolbar {
  --background: transparent;
  --border-color: #24242a;
  padding: 0 16px;
  min-height: 44px;
}

.pp-title {
  color: #fee78a;
  font-weight: 700;
  font-size: 18px;
  margin: 0;
}

.pp-header-button {
  --color: #54545f;
  --color-hover: #fee78a;
  --background-hover: rgba(254, 231, 138, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* Content */
.pp-content {
  --background: #18181a;
}

.pp-section {
  padding: 16px;
}

/* Search and Filters */
.pp-search-container {
  margin-bottom: 16px;
}

.pp-searchbar {
  --background: #24242a;
  --color: #e2e8f0;
  --placeholder-color: #94a3b8;
  --icon-color: #54545f;
  --clear-button-color: #54545f;
  border-radius: 12px;
  border: 1px solid #54545f;
}

.pp-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.pp-chip-active {
  --background: #fee78a;
  --color: #18181a;
  font-weight: 600;
}

.pp-chip-inactive {
  --background: #24242a;
  --color: #94a3b8;
  border: 1px solid #54545f;
}

/* Segment */
.pp-segment {
  --background: #24242a;
  border-radius: 12px;
  border: 1px solid #54545f;
}

.pp-segment-button {
  --color: #94a3b8;
  --color-checked: #18181a;
  --background-checked: #fee78a;
  --indicator-color: transparent;
  font-weight: 600;
}

/* Players List */
.pp-players-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pp-player-card {
  background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.pp-player-card:hover {
  border-color: #fee78a;
  transform: translateY(-2px);
}

.pp-player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.pp-player-avatar {
  width: 56px;
  height: 56px;
  border: 2px solid #fee78a;
  box-shadow: 0 2px 8px rgba(254, 231, 138, 0.2);
}

.pp-player-avatar img {
  border-radius: 50%;
}

.pp-player-details {
  flex: 1;
  min-width: 0;
}

.pp-player-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.pp-player-username {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pp-player-badges {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pp-verified-icon {
  color: #22c55e;
  font-size: 16px;
}

.pp-vip-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(251, 146, 60, 0.1);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 8px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
}

.pp-player-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 12px;
  margin-bottom: 4px;
}

.pp-player-club {
  font-weight: 500;
  color: #64748b;
}

.pp-player-separator {
  color: #54545f;
}

.pp-player-achievements {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fee78a;
  font-size: 11px;
  font-weight: 500;
}

.pp-achievement-icon {
  font-size: 12px;
}

/* Player Actions */
.pp-player-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pp-follow-button {
  --background: #fee78a;
  --color: #18181a;
  --border-color: #fee78a;
  font-weight: 600;
  font-size: 12px;
  min-width: 80px;
}

.pp-unfollow-button {
  --background: transparent;
  --color: #94a3b8;
  --border-color: #54545f;
  font-weight: 600;
  font-size: 12px;
  min-width: 80px;
}

.pp-unfollow-button:hover {
  --color: #ef4444;
  --border-color: #ef4444;
}

/* Empty State */
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

.pp-empty-title {
  color: #e2e8f0;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.pp-empty-description {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
  max-width: 280px;
}

/* Responsive Design */
@media (max-width: 480px) {
  .pp-player-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .pp-player-info {
    justify-content: flex-start;
  }
  
  .pp-player-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .pp-player-header {
    flex-wrap: wrap;
  }
  
  .pp-filters {
    justify-content: center;
  }
}
</style>