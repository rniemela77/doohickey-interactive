<template>
    <div class="fingerprint-container flex-column">
        <button class="fingerprint-container" @mousedown="onPressStart" @mouseup="onPressEnd"
            @mouseleave="onPressCancel" @touchstart.prevent="onPressStart" @touchend="onPressEnd"
            @touchcancel="onPressCancel" :class="{ pressed: isPressed && !isSuccess, success: isSuccess }">

            <HandDrag v-if="!isPressed && !isSuccess" class="hand-icon pulse-fade" />

            <Fingerprint v-if="isPressed && !isSuccess" class="fingerprint-icon"
                :style="{ animationDuration: HOLD_DURATION_MS + 'ms' }" />

            <span v-if="isSuccess" class="success-icon">
                ✓
            </span>
        </button>

        <div class="text-center">
            <p class="text-white" v-if="!isPressed && !isSuccess">
                HOLD TO SCAN
            </p>
            <p class="text-white" v-if="isPressed && !isSuccess">
                SCANNING...
            </p>
            <p class="text-white" v-if="isSuccess">
                SCAN COMPLETE
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import HandDrag from '../icons/HandDrag.vue';
import Fingerprint from '../icons/Fingerprint.vue';

// user has to hold down the button for 3 seconds to trigger the fingerprint
const HOLD_DURATION_MS = 3000;
const isPressed = ref(false);
const isSuccess = ref(false);
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
            isSuccess.value = true;
            setTimeout(() => {
                emit('fingerprint');
            }, 2000);
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
    width: clamp(10rem, 20vw, 15rem);
    height: clamp(10rem, 20vw, 15rem);
    border-radius: 50%;
    border: 1px solid rgba(255, 0, 0, 0.5);
}

button {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    color: white;
    transition: all 0.1s linear;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 30%;
        background: linear-gradient(to bottom, rgba(255, 0, 0, 0.5), rgba(255, 0, 0, 0.1));
        opacity: 0;
        mix-blend-mode: hard-light;
        z-index: 111;
    }
}

.hand-icon {
    width: clamp(2rem, 50%, 10rem);
    height: auto;
    opacity: 0.5;
}

.fingerprint-icon {
    width: clamp(2rem, 100%, 10rem);
    height: auto;
    opacity: 0.5;
    animation: maskIn linear;
}

@keyframes maskIn {
    0% {
        clip-path: circle(0px at center);
        color: red;
    }

    100% {
        clip-path: circle(100% at center);
        color: red;
    }
}

button.pressed {
    &::before {
        opacity: 1;
        animation: upDown 1s linear infinite;
    }
}

@keyframes upDown {

    0%,
    100% {
        top: calc(100% + 50px);
    }

    1%,
    49% {
        transform: scaleY(1);
    }

    50% {
        top: -100px;
    }

    51%,
    99% {
        transform: scaleY(-1);
    }
}

button.success {
    pointer-events: none;
    animation: blinkSuccess 1s linear forwards;
}

.success-icon {
    animation: grow 0.3s ease-in-out forwards;
    font-size: 2rem;
}

@keyframes blinkSuccess {

    0%,
    9% {
        border: 1px solid transparent;
    }

    10%,
    15% {
        border: 1px solid white;
    }

    16%,
    20% {
        border: 1px solid transparent;
    }

    26%,
    30% {
        border: 1px solid white;
    }
    100% {
        border: 1px solid white;
    }
}

@keyframes grow {
    0% {
        font-size: 0;
    }

    50% {
        font-size: 2.5rem;
    }

    100% {
        font-size: 2rem;
    }
}
</style>