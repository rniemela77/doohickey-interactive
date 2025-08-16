<template>
    <div class="loading-page">
        <div class="border">
            <button v-if="loadingStatus === 'unstarted'" @click="login">START</button>

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
import { ref, onMounted, onUnmounted } from 'vue';

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

const login = async () => {
    loadingStatus.value = 'initializing';
    // Wait for initial delay, then start counting
    await new Promise(resolve => setTimeout(resolve, LOADING_CONFIG.INITIAL_DELAY));
    loadingStatus.value = 'loading';
    startCounting();
};

onUnmounted(() => {
    // Clean up interval to prevent memory leaks
    if (loadingInterval) {
        clearInterval(loadingInterval);
    }
});

const startCounting = () => {
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
</script>

<style scoped>
.loading-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
    border: none;
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

    &:hover {
        color: white;
        text-shadow: 0 0 5px red, 0 0 10px red;
    }
}
</style>