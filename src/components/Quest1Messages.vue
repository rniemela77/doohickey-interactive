<template>
    <p class="msg-them" v-if="steps.includes(1.0)">There's not much time- synchronize the signal frequency!</p>
    <p class="msg-them" v-if="steps.includes(1.1)">You've done it! The signal is now synchronized.</p>
</template>

<script setup>
import { useQuestStore } from '../composables/useQuestStore'

const { steps } = useQuestStore()
</script>

<style scoped>

</style>