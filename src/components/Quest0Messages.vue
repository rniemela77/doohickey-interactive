<template>
    <p class="msg-them" v-if="steps.includes(0.0)">
        Thank you for joining the mission.
    </p>
    <p class="msg-them">
        The start button is a bit tricky, you'll need to hit it a few times to start.
    </p>
    <p class="msg-them" v-if="steps.includes(0.1)">
        Well, that's certainly a start!
    </p>
</template>

<script setup>
import { useQuestStore } from '../composables/useQuestStore'

const { steps } = useQuestStore()
</script>