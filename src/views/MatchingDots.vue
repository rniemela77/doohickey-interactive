<template>
    <div class="d-flex column gap h-100">
        <!-- slider - timer -->
        <div class="flex-wrap row gap d-flex">
            <!-- slider -->
            <div class="border d-flex row gap flex-2">
                <SliderControl horizontal @update-value="sliderValue = $event" label="Panel Light" />
            </div>

            <!-- timer -->
            <div class="border p-0 align-self-end flex-1">
                <TimerHud :active="timerActive" :time="timeLeftMs" :percent="timePercent"
                    :style="panelInteractivityStyle" />
            </div>
        </div>

        <!-- slots - bank extracted component -->
        <div class="border flex-1">
            <CircleMatcher ref="circleRef" :panel-style="panelInteractivityStyle"
                @started="onBoardStarted" @emptied="onBoardEmptied" @completed="onBoardCompleted" />
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import TimerHud from '../components/TimerHud.vue';
import SliderControl from '../components/SliderControl.vue';
import { useQuestStore } from '../composables/useQuestStore';
import CircleMatcher from '../components/CircleMatcher.vue';
import { useCountdownTimer } from '../composables/useCountdownTimer';
import { playSuccess } from '../helpers/sounds';

const { visibleMessages } = useQuestStore();

onMounted(() => {
    visibleMessages.value.push('pre-matching-dots');
});
onUnmounted(() => {
    resetTimer();
});


const emit = defineEmits(['questCompleted']);

// UI constants
const QUEST_STEPS = { shown: 2.0, sliderVisible: 2.1, enabled: 2.2 };
const SLIDER_ENABLE_THRESHOLD = 8;
const OPACITY_DIVISOR = 10;
const circleRef = ref(null);

// countdown timer state (starts when first piece is placed)
const TIMER_DURATION_MS = 18000;
const TICK_MS = 10;
const { active: timerActive, timeLeftMs, percent: timePercent, start: startTimer, reset: resetTimer, onExpire } = useCountdownTimer(TIMER_DURATION_MS, TICK_MS);

// slider state and derived interactivity style
const sliderValue = ref(0);
const panelInteractivityStyle = computed(() => ({
    opacity: `${sliderValue.value / OPACITY_DIVISOR}`,
    pointerEvents: `${sliderValue.value < SLIDER_ENABLE_THRESHOLD ? 'none' : 'auto'}`
}));
watch(sliderValue, (val) => {
    if (val > SLIDER_ENABLE_THRESHOLD) {
        visibleMessages.value.push('matching-dots-start');
    }
});

function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// When timer expires, clear the board
onExpire(() => {
    if (circleRef.value && typeof circleRef.value.clearBoard === 'function') {
        circleRef.value.clearBoard();
        visibleMessages.value.push('matching-dots-hint-1');
    }
    resetTimer();
});

// handlers from CircleMatcher events
function onBoardStarted() {
    if (!timerActive.value) startTimer();
}

function onBoardEmptied() {
    resetTimer();
}

async function onBoardCompleted() {
    playSuccess();
    visibleMessages.value.push('matching-dots-complete');
    resetTimer();
    await waitMs(2000);
    emit('questCompleted');
}
</script>

<style scoped>
.slots-section,
.bank-section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
}

.slots-bank-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    transition: all 0.2s ease-in-out;
}

.slots-section {
    display: flex;
    gap: 24px;
}

.slot {
    width: 96px;
    height: 96px;
    border: 2px dashed rgba(255, 255, 255, 0.35);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease-in-out;

    &.filled {
        border-style: solid;
        opacity: 0.3;
        filter: saturate(0.4);
    }

    &.correct {
        border-color: #22c55e;
        opacity: 1;
        transition: all 0.2s ease-in-out;
        animation: correct-glow 0.5s ease-in-out infinite;
        filter: saturate(1);
    }
}

.bank-section {
    display: flex;
    gap: 16px;
    min-height: 96px;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 16px;
    border-radius: 16px;
    min-width: 100%;
}

.slots-section.locked,
.bank-section.locked {
    pointer-events: none;
    opacity: 0.7;
}

/* piece styles moved into ColorPiece.vue */
</style>