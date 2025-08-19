<template>
    <div class="quest3">
        <div class="frosty-screen-container" style="height: 100%;">
            <div class="border row flex-1">
                <div style="position: relative; overflow:hidden; height: 100%; min-height: 10rem; width: 100%;">
                    <button class="download-image-btn" @click="isImageDownloaded = true"
                        v-if="showImageDownloadButton && !isImageDownloaded">Download Attachment</button>

                    <PannableImage :src="StickiePassword"
                        :style="{ opacity: isImageDownloaded ? 1 : 0, pointerEvents: isImageDownloaded ? 'auto' : 'none' }" />
                </div>
            </div>

            <div class="border d-flex align-items-center">
                <FrostyScreen :canWipe="canWipe" @erasedHalf="setErasedHalf">
                    <div v-if="canWipe" class="control-tip-overlay">
                        Drag to Clean
                        <HandDrag class="drag-indicator" />
                    </div>

                    <BatteryConnectuiUI class="battery-ui" />

                    <div class="frosty-screen-content">
                        <KeypadControls class="keypad-controls" @wrong-password="handleWrongPassword"
                            :interactive="isKeypadInteractive" @correct-password="correctPassword" />
                    </div>
                </FrostyScreen>
            </div>
        </div>
    </div>
</template>

<script setup>
import KeypadControls from '../components/KeypadControls.vue';
import { ref, computed, onMounted, watch } from 'vue';
import BatteryConnectuiUI from '../components/BatteryConnectuiUI.vue'
import FrostyScreen from '../components/FrostyScreen.vue';
import { useQuestStore } from '../composables/useQuestStore'
import HandDrag from '../icons/HandDrag.vue'
import PannableImage from '../components/PannableImage.vue'
import StickiePassword from '../../stickie-password.png'
import KnobControl from '../components/KnobControl.vue';
import DistortionEffect from '../components/DistortionEffect.vue';

const { steps } = useQuestStore()

// Reactive state
const canWipe = computed(() => steps.value[steps.value.length - 1] === 3.1 || steps.value[steps.value.length - 1] === 3.2);
const hasErasedHalf = ref(false);


// Computed properties for cleaner template logic
const shouldShowFrostyScreen = computed(() => steps.value.includes(3.1));
const isKeypadInteractive = computed(() => steps.value.includes(3.3));

const showImageDownloadButton = computed(() => steps.value[steps.value.length - 1] === 3.3);
const isImageDownloaded = ref(false);

// Event handlers
const correctPassword = () => {
    steps.value.push(3.4);
};

const handleWrongPassword = () => {
    if (!isImageDownloaded.value) {
        return;
    }
    if (steps.value[steps.value.length - 1] === 3.3) {
        steps.value.push(3.31);
    } else if (steps.value[steps.value.length - 1] === 3.32) {
        steps.value.push(3.33);
    }
};

const setErasedHalf = () => {
    console.log('setErasedHalf');
    hasErasedHalf.value = true;
};

onMounted(() => {
    steps.value.push(3.0);
});

// if hasErasedHalf, set 3.2
watch(hasErasedHalf, (newHasErasedHalf) => {
    if (newHasErasedHalf) {
        console.log('hasErasedHalf', newHasErasedHalf);
        steps.value.push(3.2);
    }
});
</script>

<style scoped>
.quest3 {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.frosty-screen-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.frosty-screen-placeholder {
    width: 100%;
    height: 100%;
    flex: 1;
}

.battery-ui {
    margin-bottom: 1rem;
    width: 100%;
}

.frosty-screen-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.keypad-controls {
    display: flex;
    align-items: stretch;
}

.control-tip-overlay {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: black;
    border: 1px solid black;
    font-size: 1.2rem;
    z-index: 10;
    gap: 2rem;
    animation: fadeOut 5s ease-in-out forwards;
}

.drag-indicator {
    top: 0;
    left: 0;
    width: 100px;
    height: 100px;
    filter: invert(1);
    animation: move 2s ease-in-out infinite;
}

.drag-indicator::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
    border-top: 40px solid transparent;
    border-bottom: 20px solid transparent;
    border-left: 40px solid black;
}

@keyframes fadeOut {

    0%,
    80% {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

@keyframes move {

    0%,
    100% {
        transform: translateX(-30%) translateY(0%);
    }

    50% {
        transform: translateX(30%) translateY(-30%);
    }
}

/* Utility classes */
.message-container {
    max-width: 500px;
}

.flex-start {
    justify-content: flex-start;
}

.flex-wrap {
    flex-wrap: wrap;
}

.download-image-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    background: none;
    border: 1px solid red;
    color: red;
    padding: 1rem 2rem;
    cursor: pointer;
    animation: pulse-fade 1s ease-in-out infinite;

    &:hover {
        animation: none;
        color: white;
    }
}
</style>