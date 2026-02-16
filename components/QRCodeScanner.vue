<template>
  <IonModal :is-open="isOpen" @didDismiss="close">
    <IonHeader>
      <IonToolbar class="pp-toolbar">
        <IonTitle class="pp-title">{{ t('checkIn.scanQR.title') }}</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="close" class="pp-header-button">
            <IonIcon :icon="closeOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent class="pp-content">
      <div class="qr-scanner-container">
        <!-- Camera Preview Area -->
        <div class="scanner-viewport">
          <div id="qr-scanner" ref="scannerElement" class="scanner-element"></div>

          <!-- Scanning Overlay -->
          <div class="scanner-overlay">
            <div class="scanner-frame"></div>
            <p class="scanner-instructions">{{ t('checkIn.scanQR.instructions') }}</p>
          </div>
        </div>

        <!-- Manual Entry Alternative -->
        <div class="manual-entry-section">
          <p class="manual-entry-label">{{ t('checkIn.scanQR.orEnterManually') }}</p>
          <IonInput
            v-model="manualCode"
            :placeholder="t('checkIn.scanQR.enterCodePlaceholder')"
            class="manual-code-input"
          />
          <IonButton
            @click="submitManualCode"
            :disabled="!manualCode"
            expand="block"
            class="pp-action-button pp-action-button--primary"
          >
            {{ t('checkIn.scanQR.submit') }}
          </IonButton>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="scanner-error">
          <IonIcon :icon="alertCircleOutline" class="error-icon" />
          <p class="error-text">{{ error }}</p>
          <IonButton @click="retryScanning" class="pp-action-button pp-action-button--retry">
            {{ t('common.retry') }}
          </IonButton>
        </div>
      </div>
    </IonContent>
  </IonModal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonInput,
} from '@ionic/vue'
import { closeOutline, alertCircleOutline } from 'ionicons/icons'
import { Html5Qrcode } from 'html5-qrcode'
import type { Html5QrcodeResult } from 'html5-qrcode'

const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  'close': []
  'scanned': [code: string]
}>()

const scannerElement = ref<HTMLDivElement | null>(null)
const manualCode = ref('')
const error = ref<string | null>(null)
let html5QrCode: Html5Qrcode | null = null

// Start scanner when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    await startScanner()
  } else {
    await stopScanner()
  }
})

const startScanner = async () => {
  try {
    error.value = null

    // Create scanner instance with element ID
    html5QrCode = new Html5Qrcode('qr-scanner')

    // Start scanning
    await html5QrCode.start(
      { facingMode: 'environment' }, // Use back camera
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      onScanSuccess,
      onScanFailure
    )
  } catch (err) {
    console.error('Failed to start QR scanner:', err)
    error.value = t('checkIn.scanQR.errors.cameraAccess')
  }
}

const stopScanner = async () => {
  try {
    if (html5QrCode && html5QrCode.isScanning) {
      await html5QrCode.stop()
      html5QrCode = null
    }
  } catch (err) {
    console.error('Failed to stop QR scanner:', err)
  }
}

const onScanSuccess = (decodedText: string, result: Html5QrcodeResult) => {
  console.log('QR Code scanned:', decodedText)
  emit('scanned', decodedText)
  stopScanner()
  close()
}

const onScanFailure = (errorMessage: string) => {
  // This fires frequently as it scans, so we don't log it
  // Only actual errors should be shown
}

const submitManualCode = () => {
  if (manualCode.value) {
    emit('scanned', manualCode.value)
    manualCode.value = ''
    close()
  }
}

const retryScanning = async () => {
  error.value = null
  await startScanner()
}

const close = () => {
  stopScanner()
  error.value = null
  manualCode.value = ''
  emit('close')
}

// Cleanup on unmount
onBeforeUnmount(() => {
  stopScanner()
})
</script>

<style scoped>
.qr-scanner-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #18181a;
}

.scanner-viewport {
  position: relative;
  flex: 1;
  background: #000000;
  overflow: hidden;
}

.scanner-element {
  width: 100%;
  height: 100%;
}

.scanner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  width: 250px;
  height: 250px;
  border: 3px solid #fee78a;
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.scanner-instructions {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  margin-top: 24px;
  text-align: center;
  padding: 0 32px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.manual-entry-section {
  padding: 24px;
  background: linear-gradient(135deg, #24242a 0%, #18181a 100%);
  border-top: 1px solid #54545f;
}

.manual-entry-label {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 12px 0;
  text-align: center;
}

.manual-code-input {
  --background: rgba(84, 84, 95, 0.1);
  --color: #e2e8f0;
  --placeholder-color: #64748b;
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  border: 1px solid #54545f;
  margin-bottom: 16px;
  font-size: 14px;
}

.scanner-error {
  padding: 24px;
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  border-top: 1px solid rgba(239, 68, 68, 0.3);
}

.error-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 12px;
}

.error-text {
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 16px 0;
}
</style>
