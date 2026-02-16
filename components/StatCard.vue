<template>
  <div class="pp-stat-card" :class="variantClass">
    <div class="pp-stat-icon" v-if="icon">
      <IonIcon :icon="icon" />
    </div>
    <div class="pp-stat-content">
      <div class="pp-stat-label">{{ label }}</div>
      <div class="pp-stat-value">{{ formattedValue }}</div>
      <div v-if="subtitle" class="pp-stat-subtitle">{{ subtitle }}</div>
    </div>
    <div v-if="showProgress && progress !== undefined" class="pp-stat-progress">
      <div class="pp-progress-bar">
        <div class="pp-progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  subtitle?: string
  icon?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  showProgress?: boolean
  progress?: number
  format?: 'number' | 'currency' | 'percentage'
}>()

const variantClass = computed(() => {
  return props.variant ? `pp-stat-card--${props.variant}` : ''
})

const formattedValue = computed(() => {
  const value = props.value

  if (props.format === 'currency' && typeof value === 'number') {
    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  if (props.format === 'percentage' && typeof value === 'number') {
    return `${value}%`
  }

  if (props.format === 'number' && typeof value === 'number') {
    return new Intl.NumberFormat('fr-BE').format(value)
  }

  return value.toString()
})
</script>

<style scoped>
.pp-stat-card {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.08), rgba(71, 85, 105, 0.08));
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
}

.pp-stat-card:hover {
  border-color: rgba(100, 116, 139, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(100, 116, 139, 0.15);
}

.pp-stat-card--primary {
  background: linear-gradient(135deg, rgba(254, 231, 138, 0.1), rgba(251, 191, 36, 0.05));
  border-color: rgba(254, 231, 138, 0.3);
}

.pp-stat-card--success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05));
  border-color: rgba(34, 197, 94, 0.3);
}

.pp-stat-card--warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05));
  border-color: rgba(245, 158, 11, 0.3);
}

.pp-stat-card--danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  border-color: rgba(239, 68, 68, 0.3);
}

.pp-stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(100, 116, 139, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 20px;
}

.pp-stat-card--primary .pp-stat-icon {
  background: rgba(254, 231, 138, 0.2);
  color: #fee78a;
}

.pp-stat-card--success .pp-stat-icon {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.pp-stat-card--warning .pp-stat-icon {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.pp-stat-card--danger .pp-stat-icon {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.pp-stat-content {
  flex: 1;
}

.pp-stat-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.pp-stat-value {
  color: #fee78a;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pp-stat-card--success .pp-stat-value {
  color: #22c55e;
}

.pp-stat-card--warning .pp-stat-value {
  color: #f59e0b;
}

.pp-stat-card--danger .pp-stat-value {
  color: #ef4444;
}

.pp-stat-subtitle {
  color: #64748b;
  font-size: 11px;
  font-weight: 400;
}

.pp-stat-progress {
  margin-top: 8px;
}

.pp-progress-bar {
  height: 4px;
  background: rgba(84, 84, 95, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.pp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #64748b, #475569);
  transition: width 0.5s ease;
}

.pp-stat-card--primary .pp-progress-fill {
  background: linear-gradient(90deg, #fee78a, #fbbf24);
}

.pp-stat-card--success .pp-progress-fill {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.pp-stat-card--warning .pp-progress-fill {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.pp-stat-card--danger .pp-progress-fill {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}
</style>
