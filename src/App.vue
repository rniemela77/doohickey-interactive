<template>
    <div>
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

const showIntro = ref(false); // should set to true
const showQuest1 = ref(false);
const showQuest2 = ref(false);
const showQuest3 = ref(true);

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
</style>
