<template>
  <IonPage class="pp-page">
    <!-- Header -->
    <IonHeader :translucent="true" class="pp-header">
      <IonToolbar class="pp-toolbar">
        <IonButtons slot="start">
          <IonButton @click="$router.back()" class="pp-header-button">
            <IonIcon :icon="arrowBackOutline" />
          </IonButton>
        </IonButtons>
        <IonTitle class="pp-title">Tournament Details</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="shareTournament" class="pp-header-button">
            <IonIcon :icon="shareOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true" class="pp-content">
      <TournamentDetail :tournament-id="tournamentId" />
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
} from '@ionic/vue'
import {
  arrowBackOutline,
  shareOutline,
} from 'ionicons/icons'
import TournamentDetail from '@/components/TournamentDetail.vue'
import { useRoute } from 'vue-router'

// Get the tournament ID from the route
const route = useRoute()
const tournamentId = route.params.id as string

const shareTournament = () => {
  // Share functionality
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

.pp-title {
  color: #fee78a;
  font-weight: 700;
  font-size: 20px;
}

.pp-header-button {
  --color: #54545f;
  --color-hover: #fee78a;
  --background-hover: rgba(254, 231, 138, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.pp-content {
  --background: #18181a;
}
</style>