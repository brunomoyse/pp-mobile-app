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

</script>
