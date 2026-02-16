<template>
  <IonBadge :class="badgeClass" class="pp-registration-status-badge">
    <IonIcon v-if="showIcon" :icon="statusIcon" class="pp-badge-icon" />
    <span class="pp-badge-text">{{ statusText }}</span>
  </IonBadge>
</template>

<script setup lang="ts">
import { IonBadge, IonIcon } from '@ionic/vue'
import { computed } from 'vue'
import {
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  alertCircleOutline,
  personOutline,
  trophyOutline,
} from 'ionicons/icons'

const { t } = useI18n()

type RegistrationStatus =
  | 'REGISTERED'
  | 'CHECKED_IN'
  | 'SEATED'
  | 'BUSTED'
  | 'WAITLISTED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'FINISHED'

const props = defineProps<{
  status: RegistrationStatus
  showIcon?: boolean
}>()

const badgeClass = computed(() => {
  const statusMap: Record<RegistrationStatus, string> = {
    REGISTERED: 'pp-status-registered',
    CHECKED_IN: 'pp-status-checked-in',
    SEATED: 'pp-status-seated',
    BUSTED: 'pp-status-busted',
    WAITLISTED: 'pp-status-waitlisted',
    CANCELLED: 'pp-status-cancelled',
    NO_SHOW: 'pp-status-no-show',
    FINISHED: 'pp-status-finished',
  }
  return statusMap[props.status] || 'pp-status-default'
})

const statusIcon = computed(() => {
  const iconMap: Record<RegistrationStatus, string> = {
    REGISTERED: checkmarkCircleOutline,
    CHECKED_IN: personOutline,
    SEATED: personOutline,
    BUSTED: closeCircleOutline,
    WAITLISTED: timeOutline,
    CANCELLED: closeCircleOutline,
    NO_SHOW: alertCircleOutline,
    FINISHED: trophyOutline,
  }
  return iconMap[props.status] || checkmarkCircleOutline
})

const statusText = computed(() => {
  return t(`registrationStatus.${props.status.toLowerCase()}`)
})
</script>

<style scoped>
.pp-registration-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 12px;
}

.pp-badge-icon {
  font-size: 14px;
}

.pp-badge-text {
  line-height: 1;
}

/* Status Colors */
.pp-status-registered {
  --background: rgba(34, 197, 94, 0.2);
  --color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.pp-status-checked-in {
  --background: rgba(59, 130, 246, 0.2);
  --color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.pp-status-seated {
  --background: rgba(168, 85, 247, 0.2);
  --color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.4);
}

.pp-status-busted {
  --background: rgba(239, 68, 68, 0.2);
  --color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.pp-status-waitlisted {
  --background: rgba(245, 158, 11, 0.2);
  --color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.pp-status-cancelled {
  --background: rgba(100, 116, 139, 0.2);
  --color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.4);
}

.pp-status-no-show {
  --background: rgba(239, 68, 68, 0.15);
  --color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.pp-status-finished {
  --background: rgba(254, 231, 138, 0.2);
  --color: #fee78a;
  border: 1px solid rgba(254, 231, 138, 0.4);
}

.pp-status-default {
  --background: rgba(100, 116, 139, 0.1);
  --color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}
</style>
