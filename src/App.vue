<template>
    <div class="container">
        <transition name="fade">
            <Intro v-if="showIntro" @loadingComplete="loadingComplete" />
        </transition>

        <transition name="fade">
            <Quest1 v-if="showQuest1" @questCompleted="questCompleted" />
        </transition>

        <transition name="fade">
            <Quest2 v-if="showQuest2" />
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
import Quest2 from './views/Quest2.vue';

const showIntro = ref(false); // should set to true
const showQuest1 = ref(false);
const showQuest2 = ref(true);

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
