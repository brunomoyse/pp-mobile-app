<template>
  <div v-if="isOpen" class="qr-modal-overlay" @click.self="close">
    <div class="qr-modal-content">
      <!-- Header -->
      <div class="qr-modal-header">
        <h2 class="qr-modal-title">{{ t('mySeats.qrCode.title') }}</h2>
        <button @click="close" class="qr-modal-close">
          <IonIcon :icon="closeOutline" />
        </button>
      </div>

      <!-- QR Code Display -->
      <div class="qr-modal-body">
        <div v-if="loading" class="qr-loading">
          <IonSpinner name="dots" />
        </div>
        <div v-else-if="qrDataUrl" class="qr-container">
          <img :src="qrDataUrl" alt="Check-in QR Code" class="qr-image" />
        </div>
        <div v-else class="qr-error">
          <IonIcon :icon="alertCircleOutline" class="qr-error-icon" />
          <p>{{ t('mySeats.qrCode.error') }}</p>
        </div>

        <p class="qr-instructions">{{ t('mySeats.qrCode.instructions') }}</p>
      </div>

      <!-- Footer -->
      <div class="qr-modal-footer">
        <IonButton @click="close" expand="block" class="pp-action-button pp-action-button--secondary">
          {{ t('common.close') }}
        </IonButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton, IonSpinner } from '@ionic/vue'
import { closeOutline, alertCircleOutline } from 'ionicons/icons'
import QRCode from 'qrcode'

const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
  registrationId: string
}>()

const emit = defineEmits<{
  'close': []
}>()

const qrDataUrl = ref<string | null>(null)
const loading = ref(false)

// Generate QR code when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.registrationId) {
    await generateQRCode()
  } else {
    qrDataUrl.value = null
  }
})

const generateQRCode = async () => {
  try {
    loading.value = true
    qrDataUrl.value = await QRCode.toDataURL(props.registrationId, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (error) {
    console.error('Failed to generate QR code:', error)
    qrDataUrl.value = null
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.qr-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.qr-modal-content {
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border: 1px solid #54545f;
  border-radius: 20px;
  width: 100%;
  max-width: 340px;
  overflow: hidden;
}

.qr-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #54545f;
}

.qr-modal-title {
  color: #fee78a;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.qr-modal-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.qr-modal-close:hover {
  color: #ffffff;
}

.qr-modal-body {
  padding: 24px;
  text-align: center;
}

.qr-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 256px;
}

.qr-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: inline-block;
  margin-bottom: 16px;
}

.qr-image {
  display: block;
  width: 224px;
  height: 224px;
}

.qr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  color: #ef4444;
}

.qr-error-icon {
  font-size: 48px;
}

.qr-instructions {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.qr-modal-footer {
  padding: 16px 20px 20px;
  border-top: 1px solid #54545f;
}
</style>
