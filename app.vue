<template>
  <IonApp class="pp-app">
    <IonTabs>
      <IonRouterOutlet />
      
      <!-- Premium Bottom Navigation -->
      <IonTabBar slot="bottom" class="pp-tabbar" :selectedTab="currentTab">
        <IonTabButton tab="index" href="/" class="pp-tab-button">
          <IonIcon :icon="homeOutline" />
          <IonLabel>{{ t('nav.home') }}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tournaments" href="/tournaments" class="pp-tab-button">
          <IonIcon :icon="calendarOutline" />
          <IonLabel>{{ t('nav.events') }}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="registrations" href="/registrations" class="pp-tab-button">
          <IonIcon :icon="fileTrayFullOutline" />
          <IonLabel>{{ t('nav.mySeats') }}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="leaderboard" href="/leaderboard" class="pp-tab-button">
          <IonIcon :icon="trophyOutline" />
          <IonLabel>{{ t('nav.leaders') }}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/profile" class="pp-tab-button">
          <IonIcon :icon="personCircleOutline" />
          <IonLabel>{{ t('nav.me') }}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonApp>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/vue'
import {
  homeOutline,
  calendarOutline,
  fileTrayFullOutline,
  trophyOutline,
  personCircleOutline,
} from 'ionicons/icons'

// Use custom i18n composable
const { t } = useI18n()

// Get current route to determine active tab
const route = useRoute()
const currentTab = computed(() => {
  const path = route.path
  if (path === '/') return 'index'
  if (path.startsWith('/tournaments')) return 'tournaments'
  if (path.startsWith('/registrations')) return 'registrations'
  if (path.startsWith('/leaderboard')) return 'leaderboard'
  if (path.startsWith('/profile')) return 'profile'
  return 'index' // default fallback
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

.pp-app {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #18181a;
}

.pp-tabbar {
  --background: #18181a;
  --border: 1px solid #24242a;
  height: 70px;
  border-top: 1px solid #24242a;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.pp-tab-button {
  --color: #54545f;
  --color-selected: #fee78a;
  --background-focused: transparent;
  --background-focused-opacity: 0;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 12px;
  margin: 6px;
}

.pp-tab-button:hover {
  --color: #fee78a;
  background: rgba(254, 231, 138, 0.1);
}

.pp-tab-button.tab-selected {
  --color: #fee78a;
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2));
  border: 1px solid rgba(100, 116, 139, 0.6);
}

.pp-tab-button ion-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.pp-tab-button ion-label {
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
}
</style>