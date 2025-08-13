<template>
    <div class="container">
        <transition name="fade">
            <Intro v-if="showIntro" @loadingComplete="loadingComplete" />
        </transition>

        <transition name="fade">
            <Quest1 v-if="showQuest1" @questCompleted="questCompleted" />
        </transition>

        <transition name="fade">
            <div v-if="showQuest2">quest2</div>
        </transition>
        <!-- <BigRedText />

    <div class="row">
      <div class="column col-25">
        <div class="tasks">
          <div class="task" v-for="i in 3" :key="i">Task {{ i }}</div>
        </div>
        <div class="chats">
          <div class="chat" v-for="i in 3" :key="i">Chat {{ i }}</div>
        </div>
      </div>

      <div class="column col-75">
        <KeypadControls />
        <SliderControl />
        <KnobControl />
      </div> -->
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Intro from './views/Intro.vue';
import Quest1 from './views/Quest1.vue';

const showIntro = ref(false); // should set to true
const showQuest1 = ref(true);
const showQuest2 = ref(false);

function loadingComplete() {
    showIntro.value = false;
    console.log('loading complete');

    // wait 1s, then show quest1
    setTimeout(() => {
        showQuest1.value = true;
    }, 2000);
}

function questCompleted() {
    showQuest1.value = false;

    // wait 1s, then show quest2
    setTimeout(() => {
        showQuest2.value = true;
    }, 2000);
}
</script>

<style>
.container * {
    /* border: 1px solid lab(87.82 -79.28 80.98 / 0.2); */
    /* padding: 1rem; */
}

.container {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    /* border: 1px solid red; */
}

.row {
    display: flex;
    flex-direction: row;
}

.row .column {
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
