<template>
    <div class="quest3">
        <div class="frosty-screen-container" style="height: 100%;">
            <div class="border d-flex align-items-center justify-content-center border gap">
                
                    <FrostyScreen :canWipe="canWipe" @erasedHalf="setErasedHalf">
                        <div v-if="canWipe" class="control-tip-overlay">
                            Drag to Clean
                            <HandDrag class="drag-indicator" />
                        </div>

                        <BatteryConnectuiUI class="battery-ui" />

                        <div class="frosty-screen-content d-flex justify-content-center">
                            <KeypadControls class="keypad-controls" @wrong-password="handleWrongPassword"
                                :interactive="!canWipe" @correct-password="correctPassword" />
                        </div>
                        <ErrorSpazzOverlay v-if="!hasErasedHalf" style="height: 100%; width: 100%; z-index: 1000; position: absolute; top: 0; left: 0;" ></ErrorSpazzOverlay>
                    </FrostyScreen>

                <div class="column wipe-buttons gap">
                    <button @click="canWipe = true" :style="{ opacity: canWipe ? 1 : 0.3 }">Wipe</button>
                    <button @click="canWipe = false" :style="{ opacity: canWipe ? 0.3 : 1 }">Interact</button>
                </div>
            </div>

            <div class="row flex-1">
                <div style="position: relative; overflow:hidden; height: 100%; min-height: 10rem; width: 100%;">
                    <button class="download-image-btn" @click="isImageDownloaded = true"
                        v-if="showImageDownloadButton && !isImageDownloaded">DECRYPT SIGNAL</button>

                    <PannableImage :src="StickiePassword"
                        :style="{ opacity: isImageDownloaded ? 1 : 0, pointerEvents: isImageDownloaded ? 'auto' : 'none' }" />
                </div>
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
import ErrorSpazzOverlay from '../components/ErrorSpazzOverlay.vue';
import { playSuccess, playError } from '../helpers/sounds';

const { visibleMessages } = useQuestStore()

// Reactive state
const canWipe = ref(true);
const hasErasedHalf = ref(false);
const wrongAnswers = ref(0);

const showImageDownloadButton = computed(() => hasErasedHalf.value);
const isImageDownloaded = ref(false);

// Event handlers
const emit = defineEmits(['questCompleted'])
const correctPassword = () => {
    playSuccess()
    visibleMessages.value.push('keypad-entry-complete');
    setTimeout(() => {
        emit('questCompleted')
    }, 1000)
};

const handleWrongPassword = () => {
    playError()
    if (!isImageDownloaded.value) {
        return;
    }
    wrongAnswers.value += 1;
    if (wrongAnswers.value > 1) {
        visibleMessages.value.push('keypad-entry-hint-1');
    }
};

const setErasedHalf = () => {
    hasErasedHalf.value = true;
};

// when image downloaded, set canWipe to false
watch(isImageDownloaded, (newIsImageDownloaded) => {
    if (newIsImageDownloaded) {
        canWipe.value = false;
    }
});

onMounted(() => {
    visibleMessages.value.push('sludge-start');
});

// if hasErasedHalf, set 3.2
watch(hasErasedHalf, (newHasErasedHalf) => {
    if (newHasErasedHalf) {
        visibleMessages.value.push('sludge-end');
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

.wipe-buttons {
    width: 100px;

    button {
        font-size: 1.2rem;
        padding: 1rem;
        border: 1px solid red;
        color: red;
        background: none;
        cursor: pointer;
        width: 100%;
        height: 100%;
    }

}
</style>