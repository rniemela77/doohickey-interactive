<template>
    <button class="fingerprint-container" @mousedown="onPressStart" @mouseup="onPressEnd" @mouseleave="onPressCancel"
        @touchstart.prevent="onPressStart" @touchend="onPressEnd" @touchcancel="onPressCancel"
        :class="{ pressed: isPressed }">
    </button>
</template>

<script setup>
import { ref } from 'vue';

// user has to hold down the button for 3 seconds to trigger the fingerprint
const HOLD_DURATION_MS = 3000;
const isPressed = ref(false);
let holdTimerId = null;

const emit = defineEmits(['fingerprint']);

function onPressStart(e) {
    e.preventDefault();
    e.stopPropagation();
    isPressed.value = true;
    clearHoldTimer();
    holdTimerId = setTimeout(() => {
        // success only if still held
        if (isPressed.value) {
            emit('fingerprint');
        }
        clearHoldTimer();
    }, HOLD_DURATION_MS);
}

function onPressEnd(e) {
    e.preventDefault();
    e.stopPropagation();
    // If released before timer fires, cancel and reset state
    if (holdTimerId) {
        clearHoldTimer();
    }
    isPressed.value = false;
}

function onPressCancel(e) {
    e.preventDefault();
    e.stopPropagation();
    clearHoldTimer();
    isPressed.value = false;
}

function clearHoldTimer() {
    if (holdTimerId) {
        clearTimeout(holdTimerId);
        holdTimerId = null;
    }
}

</script>

<style scoped>
.fingerprint-container {
    width: 6rem;
    height: 6rem;
    border: 1px solid red;
    border-radius: 4px;
}

button {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0%;
        height: 0%;
        transform: translate(-50%, -50%);
        transition: all 0.1s linear;
        background: rgba(255, 0, 0, 0.5);
    }   
    &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0%;
        height: 0%;
        transform: translate(-50%, -50%);
        transition: all 0.1s linear;
        background: rgba(255, 0, 0, 0.5);
    }
}

button.pressed {
    /* background: rgba(255, 0, 0, 0.5); */

    &::before {
        width: 100%;
        height: 100%;
        transition: all 3s linear;
    }
    &::after {
        width: 100%;
        height: 100%;
        transition: all 3s linear;
    }
}
</style>