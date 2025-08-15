<template>
    <div class="container">
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
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Intro from './views/Intro.vue';
import Quest1 from './views/Quest1.vue';
import Quest2 from './views/Quest2.vue';
import Quest3 from './views/Quest3.vue';

const showIntro = ref(false); // should set to true
const showQuest1 = ref(false);
const showQuest2 = ref(true);
const showQuest3 = ref(false);

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
        }
    }, 2000);
}
</script>

<style>
.p-0 {
    padding: 0!important;
}

.container {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}


.border {
    border: 1px solid rgba(255, 0, 0, 0.6);
    border-radius: 4px;
    padding: 1rem;
}

.gap {
    gap: 1rem;
}

.row {
    display: flex;
    flex-direction: row;
}

.full-size {
    width: 100%;
    height: auto;
}

.column {
    display: flex;
    flex-direction: column;
}

.col-25 {
    width: 25%;
}

.col-75 {
    width: 75%;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 1.7s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
