<template>
    <div class="container">
        <div class="border message-log" :class="{ 'message-log-expanded': isMessageLogExpanded }">
            <MessageLog :is-expanded="isMessageLogExpanded" @toggle-expand="isMessageLogExpanded = $event" />
        </div>
        
        <div class="quest-container">
            <transition name="fade">
                <Intro v-if="showIntro" @loadingComplete="loadingComplete" />
            </transition>
            
            <transition name="fade">
                <Quest1 v-if="showQuest1" @questCompleted="questCompleted(1)" />
            </transition>
            
            <transition name="fade">
                <Quest2 v-if="showQuest2" @questCompleted="questCompleted(2)" />
            </transition>
            
            <transition name="fade">
                <Quest3 v-if="showQuest3" @questCompleted="questCompleted(3)" />
            </transition>

            <transition name="fade">
                <Quest5 v-if="showQuest5" @questCompleted="questCompleted(5)" />
            </transition>
        </div>

        <GlitchOverlay />

        <AppBg />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Intro from './views/Intro.vue';
import Quest1 from './views/Quest1.vue';
import Quest2 from './views/Quest2.vue';
import Quest3 from './views/Quest3.vue';
import AppBg from './components/AppBg.vue';
import MessageLog from './components/MessageLog.vue';
import GlitchOverlay from './components/GlitchyOverlay.vue';
import Quest5 from './views/Quest5.vue';

const showIntro = ref(true); // should set to true
const showQuest1 = ref(false);
const showQuest2 = ref(false);
const showQuest3 = ref(false);
const showQuest5 = ref(false);

const isMessageLogExpanded = ref(true);

function loadingComplete() {
    showIntro.value = false;
    console.log('loading complete');

    // wait 1s, then show quest1
    setTimeout(() => {
        showQuest1.value = true;
    }, 2000);
}

function questCompleted(questNumber) {
    if (questNumber === 1) {
        showQuest1.value = false;
    } else if (questNumber === 2) {
        showQuest2.value = false;
    } else if (questNumber === 3) {
        showQuest3.value = false;
    }

    // wait 1s, then show the next quest
    setTimeout(() => {
        if (questNumber === 1) {
            showQuest2.value = true;
        } else if (questNumber === 2) {
            showQuest3.value = true;
        } else if (questNumber === 3) {
            showQuest5.value = true;
        }
    }, 2000);
}
</script>

<style scoped>
.container {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content:flex-end;
    gap: 1rem;

    & > * {
        transition: flex 0.3s ease-in-out, width 0.3s ease-in-out;
    }
}

.message-log {
    flex: 0;
    width: auto;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
}

.message-log-expanded {
    flex: 0 0 30%;
}

.quest-container {
    flex: 1;
}

@media screen and (max-width: 768px) {
    .message-log {
        width: 10%;
        height:100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 300;

        :deep(.message-expand-button) {
            position: absolute;
            top:0;
            right:0;
        }
    }
    .quest-container {
        padding-left: 10%;
    }
    .message-log-expanded {
        height:100%;
        width: 90%;

    }
}
</style>
