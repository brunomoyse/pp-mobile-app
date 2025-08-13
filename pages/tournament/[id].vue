<template>
  <TournamentDetail :tournament-id="tournamentId" />
</template>

<script setup lang="ts">
console.log('TournamentDetail page loaded')
import TournamentDetail from '@/components/TournamentDetail.vue'
import { useRoute } from 'vue-router'

// Get the tournament ID from the route
const route = useRoute()
const tournamentId = route.params.id as string
</script>