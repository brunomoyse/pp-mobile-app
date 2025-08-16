<template>
  <div class="pp-edit-profile-modal">
    <IonHeader class="pp-modal-header">
      <IonToolbar class="pp-modal-toolbar">
        <IonTitle class="pp-modal-title">{{ t('profile.editProfile') }}</IonTitle>
        <IonButtons slot="end">
          <IonButton fill="clear" @click="$emit('close')" class="pp-modal-close">
            <IonIcon :icon="closeOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent class="pp-modal-content">
      <IonList class="pp-form-list">
        <!-- Personal Information Section -->
        <div class="pp-form-section">
          <h3 class="pp-section-title">{{ t('profile.personalInfo') }}</h3>
          
          <IonItem class="pp-form-item">
            <IonLabel position="stacked" class="pp-form-label">{{ t('profile.firstName') }}</IonLabel>
            <IonInput
              v-model="form.first_name"
              :placeholder="t('profile.firstName')"
              class="pp-form-input"
            />
          </IonItem>
          
          <IonItem class="pp-form-item">
            <IonLabel position="stacked" class="pp-form-label">{{ t('profile.lastName') }}</IonLabel>
            <IonInput
              v-model="form.last_name"
              :placeholder="t('profile.lastName')"
              class="pp-form-input"
            />
          </IonItem>
          
          <IonItem class="pp-form-item">
            <IonLabel position="stacked" class="pp-form-label">{{ t('profile.username') }}</IonLabel>
            <IonInput
              v-model="form.username"
              :placeholder="t('profile.username')"
              class="pp-form-input"
            />
          </IonItem>
          
          <IonItem class="pp-form-item">
            <IonLabel position="stacked" class="pp-form-label">{{ t('profile.email') }}</IonLabel>
            <IonInput
              v-model="form.email"
              :placeholder="t('profile.email')"
              type="email"
              class="pp-form-input"
            />
          </IonItem>
          
          <IonItem class="pp-form-item">
            <IonLabel position="stacked" class="pp-form-label">{{ t('profile.phone') }}</IonLabel>
            <IonInput
              v-model="form.phone"
              :placeholder="t('profile.phone')"
              type="tel"
              class="pp-form-input"
            />
          </IonItem>
        </div>

        <!-- Display Preferences Section -->
        <div class="pp-form-section">
          <h3 class="pp-section-title">{{ t('profile.displayPreferences') }}</h3>
          
          <IonItem class="pp-form-item">
            <IonLabel position="stacked" class="pp-form-label">{{ t('profile.displayName') }}</IonLabel>
            <IonSelect
              v-model="form.display_preference"
              :placeholder="t('profile.displayName')"
              class="pp-form-select"
            >
              <IonSelectOption value="real_name">{{ t('profile.realName') }}</IonSelectOption>
              <IonSelectOption value="username">{{ t('profile.username') }}</IonSelectOption>
              <IonSelectOption value="both">{{ t('profile.both') }}</IonSelectOption>
            </IonSelect>
          </IonItem>
          
          <!-- Preview Card -->
          <IonCard class="pp-preview-card">
            <IonCardHeader>
              <IonCardTitle class="pp-preview-title">{{ t('profile.preview') }}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText class="pp-preview-text">
                <p>{{ t('profile.howYourNameAppears') }}</p>
                <strong class="pp-preview-name">{{ displayName }}</strong>
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>
      </IonList>

      <!-- Action Buttons -->
      <div class="pp-form-actions">
        <IonButton
          fill="outline"
          @click="$emit('close')"
          :disabled="loading"
          class="pp-cancel-button"
        >
          {{ t('profile.cancel') }}
        </IonButton>
        <IonButton
          @click="handleSave"
          :disabled="loading"
          class="pp-save-button"
        >
          <IonIcon :icon="saveOutline" slot="start" />
          {{ loading ? t('profile.saving') : t('profile.save') }}
        </IonButton>
      </div>
    </IonContent>
  </div>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
} from '@ionic/vue'
import { closeOutline, saveOutline } from 'ionicons/icons'
import { reactive, computed } from 'vue'
import type { User } from '~/types/graphql'

interface Props {
  user?: User | null
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const form = reactive({
  first_name: props.user?.first_name || '',
  last_name: props.user?.last_name || '',
  username: props.user?.username || '',
  email: props.user?.email || '',
  phone: props.user?.phone || '',
  display_preference: props.user?.display_preference || 'real_name' as 'real_name' | 'username' | 'both'
})

const displayName = computed(() => {
  switch (form.display_preference) {
    case 'real_name':
      return `${form.first_name} ${form.last_name}`.trim() || 'N/A'
    case 'username':
      return form.username || 'N/A'
    case 'both':
      return `${form.first_name} "${form.username}" ${form.last_name}`.trim() || 'N/A'
    default:
      return 'N/A'
  }
})

const handleSave = () => {
  emit('save', {
    ...form,
    display_name: displayName.value
  })
}
</script>

<style scoped>
.pp-edit-profile-modal {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pp-modal-header {
  --background: rgba(24, 24, 26, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.pp-modal-toolbar {
  --background: transparent;
  --border-color: #24242a;
  border-bottom: 1px solid #24242a;
}

.pp-modal-title {
  color: #fee78a;
  font-weight: 700;
  font-size: 18px;
}

.pp-modal-close {
  --color: #54545f;
  --color-hover: #fee78a;
  --background-hover: rgba(254, 231, 138, 0.1);
}

.pp-modal-content {
  --background: #18181a;
  flex: 1;
}

.pp-form-list {
  padding: 0;
  background: transparent;
}

.pp-form-section {
  margin-bottom: 24px;
  padding: 0 16px;
}

.pp-section-title {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding: 0 4px;
}

.pp-form-item {
  --background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  --border-color: #54545f;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin: 0 0 12px 0;
  --padding-start: 16px;
  --padding-end: 16px;
}

.pp-form-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
}

.pp-form-input,
.pp-form-select {
  --color: #e2e8f0;
  --placeholder-color: #64748b;
  font-size: 16px;
}

.pp-preview-card {
  --background: linear-gradient(135deg, #24242a 0%, #1a1a1e 100%);
  border: 1px solid #54545f;
  border-radius: 12px;
  margin: 16px 0 0 0;
}

.pp-preview-title {
  color: #fee78a;
  font-size: 14px;
  font-weight: 600;
}

.pp-preview-text {
  color: #94a3b8;
  font-size: 14px;
}

.pp-preview-text p {
  margin: 0 0 8px 0;
}

.pp-preview-name {
  color: #fee78a;
  font-size: 16px;
  font-weight: 600;
}

.pp-form-actions {
  display: flex;
  gap: 12px;
  padding: 24px 16px;
  background: #18181a;
  border-top: 1px solid #24242a;
}

.pp-cancel-button {
  flex: 1;
  --color: #94a3b8;
  --border-color: #54545f;
  --background-hover: rgba(148, 163, 184, 0.1);
  height: 44px;
  font-weight: 600;
}

.pp-save-button {
  flex: 2;
  --background: #fee78a;
  --color: #18181a;
  --background-hover: #fcd34d;
  height: 44px;
  font-weight: 600;
}
</style>