<template>
    <div class="container d-flex column gap">
        <div class="border message-log" :class="{ 'message-log-expanded': isMessageLogExpanded }">
            <MessageLog :is-expanded="isMessageLogExpanded" @toggle-expand="isMessageLogExpanded = $event" />
        </div>

        <div class="quest-container flex-1">
            <transition name="fade">
                <Intro v-if="currentQuest === 'intro'" @loadingComplete="completeQuest" />
            </transition>

            <transition name="fade">
                <FingerScan v-if="currentQuest === 'fingerprint'" @fingerprintSuccess="completeQuest" />
            </transition>

            <transition name="fade">
                <SyncWaves v-if="currentQuest === 'syncWaves'" @questCompleted="completeQuest" />
            </transition>

            <transition name="fade">
                <MatchingDots v-if="currentQuest === 'matchingDots'" @questCompleted="completeQuest" />
            </transition>

            <transition name="fade">
                <KeypadEntry v-if="currentQuest === 'keypadEntry'" @questCompleted="completeQuest" />
            </transition>

            <transition name="fade">
                <Quest5 v-if="currentQuest === 'quest5'" @questCompleted="completeQuest" />
            </transition>
        </div>

        <!-- <GlitchOverlay />
        <AppBg /> -->
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Intro from './views/Intro.vue';
import SyncWaves from './views/SyncWaves.vue';
import MatchingDots from './views/MatchingDots.vue';
import KeypadEntry from './views/KeypadEntry.vue';
import FingerScan from './views/FingerScan.vue';
import AppBg from './components/AppBg.vue';
import MessageLog from './components/MessageLog.vue';
import GlitchOverlay from './components/GlitchyOverlay.vue';
import Quest5 from './views/Quest5.vue';

const isMessageLogExpanded = ref(false);

const quests = [
    'intro',
    'fingerprint',
    'syncWaves',
    'matchingDots',
    'keypadEntry',
    'quest5',
]

const currentQuest = ref(quests[4]);

function completeQuest() {
    const nextQuest = quests[quests.indexOf(currentQuest.value) + 1];
    currentQuest.value = null;
    setTimeout(() => {
        currentQuest.value = nextQuest;
    }, 2000);
}
</script>

<style scoped>
.container {
    width: 100vw;
    height: 100vh;
}
</style>
