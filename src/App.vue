<template>
  <div class="container">
    <Quest1 />
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
import BigRedText from './components/BigRedText.vue'
import KeypadControls from './components/KeypadControls.vue'
import SliderControl from './components/SliderControl.vue';
import KnobControl from './components/KnobControl.vue';
import Quest1 from './Quest1.vue';
</script>

<style>
.container * {
  border: 1px solid lab(87.82 -79.28 80.98 / 0.2);
  /* padding: 1rem; */
}

.container {
  width: 100%;
  height: 100%;
  border: 1px solid red;
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
</style>
