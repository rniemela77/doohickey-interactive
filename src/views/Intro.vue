<template>
    <div class="loading-page">
        <p class="loading-title">LOADING</p>

        <div class="loading-bar">
            <div v-for="i in loadingBarMax" :key="i" class="loading-dot"
                :class="{ 'loading-dot-active': loadingBar >= i }"></div>
        </div>

        <p class="loading-subtitle">
            <span v-if="loadingStatus === 'initializing'">Initializing ...</span>
            <span v-else-if="loadingStatus === 'loading'">Preparing Control Panel ...</span>
            <span v-else>Control Panel Ready</span>
        </p>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Constants for better maintainability
const LOADING_CONFIG = {
    INITIAL_DELAY: 2000,
    INTERVAL_MS: 50,
    MAX_BARS: 35,
    PROBABILITY_THRESHOLD: 0.5
};

const emit = defineEmits(['loadingComplete']);

const loadingBar = ref(0);
const loadingBarMax = LOADING_CONFIG.MAX_BARS;
const loadingStatus = ref('initializing'); // 'initializing', 'loading', 'complete'

let loadingInterval = null;

onMounted(async () => {
    // Wait for initial delay, then start counting
    await new Promise(resolve => setTimeout(resolve, LOADING_CONFIG.INITIAL_DELAY));
    loadingStatus.value = 'loading';
    startCounting();
});

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
    text-transform: uppercase;
    margin-top: 4rem;
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
}

.loading-dot {
    width: 6px;
    height: 40px;
    border-radius: 2px;
    opacity: 0.3;
    background: red;
    border: 1px solid red;
    margin: 0 4px;
    transition: all 0.1s ease;
    transform: rotate(12deg);
}

.loading-dot-active {
    opacity: 1;
    box-shadow: 0 4px 30px 5px rgba(255, 0, 0, 0.5);
    transform: scale(1.1) rotate(12deg);
}
</style>