<template>
    <div class="loading-page">
        <div class="loading-container border" ref="loadingContainer">
            <button v-if="loadingStatus === 'unstarted'" @click="handleClick" ref="activateButton">
                <div class="loading-bar" style="top: 0; right: -5px; left: unset"
                    :style="{ width: `${clickPercentage}%` }"></div>
                ACTIVATE
                <div class="loading-bar" :style="{ width: `${clickPercentage}%` }"></div>

            </button>

            <div :style="{ opacity: loadingStatus === 'unstarted' ? 0 : 1, transition: 'opacity 0.9s ease-in-out' }">
                <p class="loading-title">LOADING</p>

                <div class="loading-bar">
                    <div v-for="i in loadingBarMax" :key="i" class="loading-dot"
                        :class="{ 'loading-dot-active': loadingBar >= i }"></div>
                </div>

                <p class="loading-subtitle">
                    <span :class="{ 'red': loadingStatus === 'initializing' }">Initializing</span>
                    <span :class="{ 'red': loadingStatus === 'loading' }">Installing</span>
                    <span :class="{ 'red': loadingStatus === 'complete' }">Ready</span>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import cracked from '../../cracked.png'
import { useQuestStore } from '../composables/useQuestStore'
import { playGlassCrack, playTap, playDrone } from '../helpers/sounds'

const { steps } = useQuestStore()

onMounted(() => {
    // wait 1s
    setTimeout(() => {
        steps.value.push(0.0);
    }, 1000);
});


// Constants for better maintainability
const LOADING_CONFIG = {
    INITIAL_DELAY: 2000,
    INTERVAL_MS: 90,
    MAX_BARS: 25,
    PROBABILITY_THRESHOLD: 0.5
};

const emit = defineEmits(['loadingComplete']);

const loadingBar = ref(0);
const loadingBarMax = LOADING_CONFIG.MAX_BARS;
const loadingStatus = ref('unstarted'); // 'unstarted', 'initializing', 'loading', 'complete'

let loadingInterval = null;

// when click on loadContainer, place an image at the mouse location
const loadingContainer = ref(null);
const clickCount = ref(0);
const activateButton = ref(null);
let jiggleTimeoutIds = [];

function clearJiggle() {
    if (jiggleTimeoutIds.length) {
        jiggleTimeoutIds.forEach(id => clearTimeout(id));
        jiggleTimeoutIds = [];
    }
    const button = activateButton.value;
    if (button) {
        button.style.transform = 'translate(-50%, -50%)';
        button.style.transition = '';
    }
}

const jiggleButton = (intensity = 1) => {
    const button = activateButton.value;
    if (!button) return;

    // Cancel any ongoing jiggle and reset
    clearJiggle();

    const amplitudeBase = 5; // px
    const amplitudePx = amplitudeBase * Math.max(1, intensity * 0.8);
    const steps = [
        { t: 0, x: 0 },
        { t: 35, x: amplitudePx },
        { t: 70, x: -amplitudePx },
        { t: 105, x: amplitudePx * 0.5 },
        { t: 140, x: 0 },
    ];

    const originalTransition = button.style.transition;
    button.style.transition = 'transform 35ms ease-out';

    steps.forEach(step => {
        const id = setTimeout(() => {
            button.style.transform = `translate(-50%, -50%) translateX(${step.x}px)`;
        }, step.t);
        jiggleTimeoutIds.push(id);
    });

    const endId = setTimeout(() => {
        button.style.transform = 'translate(-50%, -50%)';
        button.style.transition = originalTransition || '';
        jiggleTimeoutIds = [];
    }, steps[steps.length - 1].t + 50);
    jiggleTimeoutIds.push(endId);
}
const clickPercentage = ref(0);
// reduce clickPercentageby 1 every 100ms
setInterval(() => {
    if (clickPercentage.value > 0) {
        clickPercentage.value -= 4;
    }
}, 100);


const handleClick = async (e) => {
    clickPercentage.value += 20;
    playTap();
    jiggleButton(clickPercentage.value / 100);

    if (clickPercentage.value < 110) {
        return;
    }

    placeCrackedImage(e, 4);

    playGlassCrack();

    playDrone();


    loadingStatus.value = 'initializing';
    await new Promise(resolve => setTimeout(resolve, LOADING_CONFIG.INITIAL_DELAY));
    loadingStatus.value = 'loading';

    startLoading();
    steps.value.push(0.1);
};
const placeCrackedImage = (e, size, randomizeRotation = false) => {
    const imageSize = 50 * size;

    const rect = loadingContainer.value.getBoundingClientRect();
    const x = e.clientX - rect.left - imageSize / 2;
    const y = e.clientY - rect.top - imageSize / 2;
    const image = new Image();
    image.src = cracked;
    Object.assign(image.style, {
        position: 'absolute',
        backgroundOrigin: 'right',
        left: `${x + 14}px`,
        rotate: randomizeRotation ? `${Math.random() * 360}deg` : '0deg',
        top: `${y}px`,
        width: `${imageSize}px`,
        height: `${imageSize}px`,
        zIndex: '1',          // keep within the container’s stacking context
        pointerEvents: 'none', // so clicks pass through
        mixBlendMode: 'plus-lighter',
        opacity: '0.7',
        filter: 'contrast(0.8) invert(1)',
    });
    loadingContainer.value.appendChild(image);
};

const startLoading = () => {
    loadingInterval = setInterval(() => {
        loadingBar.value += Math.random() > LOADING_CONFIG.PROBABILITY_THRESHOLD ? 1 : 0;

        if (loadingBar.value >= loadingBarMax) {
            completeLoading();

            // Clean up interval when loading is complete
            if (loadingInterval) {
                clearInterval(loadingInterval);
                loadingInterval = null;
            }
        }
    }, LOADING_CONFIG.INTERVAL_MS);
};

const completeLoading = () => {
    loadingBar.value = loadingBarMax;
    loadingStatus.value = 'complete';

    // wait 1s
    setTimeout(() => {
        emit('loadingComplete');
    }, 1000);
};

onUnmounted(() => {
    clearJiggle();
});


</script>

<style scoped>
.loading-container {
    overflow: hidden;
    position: relative;
}

.loading-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.loading-title {
    font-size: 1rem;
    font-weight: bold;
    color: white;
    text-align: left;
    align-self: flex-start;
}

.loading-subtitle {
    font-size: 1rem;
    display: flex;
    justify-content: space-between;
    text-transform: uppercase;
    margin: 0;
    padding: 1.5rem 0;
    font-size: 0.6rem;

    &>* {
        color: rgba(255, 255, 255, 0.2);
        padding: 0.2rem 1rem;
        transition: all 1s ease;


        &.red {
            color: white;
            animation: flashRed 1s ease-in-out infinite;
        }
    }
}

@keyframes flashRed {

    0%,
    100% {
        color: rgba(255, 255, 255, 0.2);
    }

    50% {
        color: red;
        text-shadow: 0 0 10px red;
    }
}

.loading-subtitle-ready-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.loading-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
}

.loading-dot {
    flex: 1;
    width: 6px;
    height: 40px;
    border-radius: 2px;
    opacity: 0.3;
    background: red;
    border: 1px solid red;
    transition: all 0.1s ease;
    transform: rotate(12deg);
}

.loading-dot-active {
    opacity: 1;
    box-shadow: 0 4px 30px 5px rgba(255, 0, 0, 0.5);
    transform: scale(1.1) rotate(12deg);
}

button {
    background: none;
    color: red;
    font-size: 3rem;
    text-transform: uppercase;
    font-weight: bold;
    cursor: pointer;
    padding: 1rem 2rem;
    transition: all 0.3s ease-in-out;
    text-shadow: 0 0 1px red;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    width: 100%;
    height: 100%;
    border: none;

    &:hover {
        color: white;
        text-shadow: 0 0 5px red, 0 0 10px red;
    }

    .loading-bar {
        content: '';
        position: absolute;
        bottom: 0;
        left: -5px;
        width: 0;
        height: 5px;
        background: red;
        z-index: -1;
        opacity: 0.5;
        border-radius: 10px;
        transition: width 0.1s linear;
    }
}
</style>