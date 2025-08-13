<template>
  <div class="pp-club-selector">
    <IonButton 
      id="club-select-trigger" 
      class="pp-club-button"
      @click="showModal = true"
    >
      <IonIcon :icon="locationOutline" />
      <span class="pp-club-name">{{ selectedClub?.name || 'Select Club' }}</span>
      <IonIcon :icon="chevronDownOutline" />
    </IonButton>

    <!-- Club Selection Modal -->
    <IonModal :is-open="showModal" @did-dismiss="showModal = false" class="pp-modal">
      <IonHeader class="pp-modal-header">
        <IonToolbar class="pp-modal-toolbar">
          <IonTitle class="pp-modal-title">Select Club</IonTitle>
          <IonButtons slot="end">
            <IonButton @click="showModal = false" class="pp-modal-close">
              <IonIcon :icon="closeOutline" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent class="pp-modal-content">
        <div class="pp-club-list">
          <div 
            v-for="club in clubs" 
            :key="club.id"
            class="pp-club-option"
            :class="{ 'pp-club-selected': selectedClub?.id === club.id }"
            @click="selectClub(club)"
          >
            <div class="pp-club-info">
              <div class="pp-club-avatar">
                <IonIcon :icon="businessOutline" />
              </div>
              <div class="pp-club-details">
                <h3 class="pp-club-option-name">{{ club.name }}</h3>
                <p class="pp-club-location">{{ club.location }}</p>
                <div class="pp-club-stats">
                  <span class="pp-club-stat">{{ club.members }} members</span>
                  <span class="pp-club-separator">•</span>
                  <span class="pp-club-stat">{{ club.events }} events</span>
                </div>
              </div>
            </div>
            <IonIcon 
              v-if="selectedClub?.id === club.id"
              :icon="checkmarkCircleOutline" 
              class="pp-club-check"
            />
          </div>
        </div>
      </IonContent>
    </IonModal>
  </div>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
} from '@ionic/vue'
import {
  locationOutline,
  chevronDownOutline,
  closeOutline,
  businessOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons'
import { ref, computed } from 'vue'

// Props
interface Club {
  id: number
  name: string
  location: string
  members: number
  events: number
}

const props = defineProps<{
  modelValue?: Club | null
}>()

const emit = defineEmits<{
  'update:modelValue': [club: Club | null]
}>()

// Reactive data
const showModal = ref(false)

// Available clubs
const clubs = ref<Club[]>([
  {
    id: 1,
    name: 'Poker Palace Brussels',
    location: 'Brussels, Belgium',
    members: 1247,
    events: 42,
  },
  {
    id: 2,
    name: 'Royal Flush Club',
    location: 'Antwerp, Belgium',
    members: 856,
    events: 38,
  },
  {
    id: 3,
    name: 'Diamond Casino Ghent',
    location: 'Ghent, Belgium',
    members: 692,
    events: 29,
  },
  {
    id: 4,
    name: 'Golden Cards Liège',
    location: 'Liège, Belgium',
    members: 534,
    events: 24,
  },
  {
    id: 5,
    name: 'Ace High Society',
    location: 'Charleroi, Belgium',
    members: 423,
    events: 18,
  },
])

// Computed
const selectedClub = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const selectClub = (club: Club) => {
  selectedClub.value = club
  showModal.value = false
}
</script>

<style scoped>
/* Club Button */
.pp-club-button {
  --background: transparent;
  --color: #e2e8f0;
  --padding-start: 12px;
  --padding-end: 12px;
  height: 36px;
  border-radius: 18px;
  border: 1px solid #54545f;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pp-club-button:hover {
  --color: #fee78a;
  border-color: #fee78a;
  --background: rgba(254, 231, 138, 0.1);
}

.pp-club-name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Modal */
.pp-modal {
  --backdrop-opacity: 0.6;
}

.pp-modal-header {
  --background: #24242a;
}

.pp-modal-toolbar {
  --background: transparent;
  --border-color: #54545f;
}

.pp-modal-title {
  color: #fee78a;
  font-weight: 700;
  font-size: 18px;
}

.pp-modal-close {
  --color: #54545f;
  --color-hover: #fee78a;
}

.pp-modal-content {
  --background: #18181a;
}

/* Club List */
.pp-club-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pp-club-option {
  background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  border: 1px solid #54545f;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pp-club-option:hover {
  border-color: #fee78a;
  transform: translateY(-2px);
}

.pp-club-selected {
  border-color: #fee78a !important;
  background: linear-gradient(135deg, rgba(254, 231, 138, 0.1), rgba(254, 231, 138, 0.05));
}

.pp-club-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.pp-club-avatar {
  width: 48px;
  height: 48px;
  background: rgba(254, 231, 138, 0.1);
  border: 1px solid rgba(254, 231, 138, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fee78a;
  font-size: 20px;
}

.pp-club-details {
  flex: 1;
  min-width: 0;
}

.pp-club-option-name {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pp-club-location {
  color: #94a3b8;
  font-size: 12px;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pp-club-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
}

.pp-club-separator {
  color: #54545f;
}

.pp-club-check {
  color: #fee78a;
  font-size: 24px;
  margin-left: 12px;
}

/* Responsive Design */
@media (max-width: 480px) {
  .pp-club-name {
    max-width: 100px;
  }
  
  .pp-club-option {
    padding: 12px;
  }
  
  .pp-club-avatar {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .pp-club-option-name {
    font-size: 14px;
  }
}
</style>