<template>
    <div class="app-container">
        <div v-if="isEpilepsyWarningVisible" class="epilepsy-warning">
            <p>
                Epilepsy Warning: This game contains flashing lights and moving patterns. If you have photosensitive
                epilepsy, please do not play.
            </p>

            <button class="epilepsy-warning-button" @click="confirmEpilepsyWarning">I understand</button>
        </div>

        <div v-else class="container d-flex column gap">
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

            <SettingsOverlay />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Intro from './views/Intro.vue';
import SyncWaves from './views/SyncWaves.vue';
import MatchingDots from './views/MatchingDots.vue';
import KeypadEntry from './views/KeypadEntry.vue';
import FingerScan from './views/FingerScan.vue';
import MessageLog from './components/MessageLog.vue';
import Quest5 from './views/Quest5.vue';
import SettingsOverlay from './components/SettingsOverlay.vue';

const isMessageLogExpanded = ref(false);

const quests = [
    'intro',
    'fingerprint',
    'syncWaves',
    'matchingDots',
    'keypadEntry',
    'quest5',
]

const isEpilepsyWarningVisible = ref(true);

function confirmEpilepsyWarning() {
    isEpilepsyWarningVisible.value = false;
}

const currentQuest = ref(quests[0]);

function completeQuest() {
    const nextQuest = quests[quests.indexOf(currentQuest.value) + 1];
    currentQuest.value = null;
    setTimeout(() => {
        currentQuest.value = nextQuest;
    }, 2000);
}
</script>

<style scoped>
.app-container {
    width: 100vw;
    height: 100vh;
}
.container {
    width: 100%;
    height: 100%;
}

.epilepsy-warning {
    font-family: sans-serif;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.5);
    padding: 2rem;
    border-radius: 1rem;
    color: white;
    text-align: center;
    z-index: 1000;
    font-size: clamp(1rem, 4vw, 2rem);
    line-height:2;
    width: 90%;

    button {
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 1rem 2rem;
        border-radius: 1rem;
        cursor: pointer;
        font-size: 1.2rem;
        margin-top: 2rem;

        &:hover {
            background: white;
            color: black;
        }
    }
}
</style>
