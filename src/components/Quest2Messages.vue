<template>
    <div>
        <p class="msg-them" v-if="steps.includes(2.0)">
            The control panel is here, here's a fingerprint scanner. Hold your finger to it.
        </p>

        <p class="msg-them" v-if="steps.includes(2.1)">
            Perfect. Now see if we can get the full panel lit up.
        </p>

        <p class="msg-them" v-if="steps.includes(2.2)">
            You've done it! It seems like this control panel is a bit different- see if you can
            figure out how to use it.
        </p>
    </div>
</template>

<script setup>
import { useQuestStore } from '../composables/useQuestStore'

const { steps } = useQuestStore()
</script>

<style scoped></style>