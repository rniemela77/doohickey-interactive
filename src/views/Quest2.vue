<template>
    <div class="quest2">

        <div class="row gap full-size">
            <div class="border full-size">
                <SliderControl horizontal @update-value="sliderValue = $event" label="Panel Lighting" />
            </div>

            <div class="timer-section border p-0">
                <TimerHud :active="timerActive" :time="timeLeftMs" :percent="timePercent" />
            </div>
        </div>

        <div class="slots-section-container border" :style="{ opacity: `${sliderValue / 10}` }">
            <div class="slots-section" :class="{ locked: isCompleted }" @dragover.prevent>
                <div v-for="(slotColor, slotIndex) in slots" :key="`slot-${slotIndex}`" class="slot"
                    :class="{ filled: !!slotColor, correct: slotColor && slotColor === TARGET_ORDER[slotIndex] }"
                    @dragover.prevent @drop="handleDropOnSlot(slotIndex, $event)">
                    <div v-if="slotColor" class="piece" :style="{ background: colorToCss(slotColor) }"
                        :draggable="!isCompleted" @dragstart="handleDragStartFromSlot(slotIndex, slotColor, $event)" />
                </div>
            </div>

            <div class="bank-section" :class="{ locked: isCompleted }" @dragover.prevent
                @drop="handleDropOnBank($event)">
                <div v-for="(color, idx) in bankPieces" :key="`bank-${color}`" class="piece"
                    :style="{ background: colorToCss(color) }" :draggable="!isCompleted"
                    @dragstart="handleDragStartFromBank(color, $event)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import TimerHud from '../components/TimerHud.vue';
import SliderControl from '../components/SliderControl.vue';

const sliderValue = ref(0);

const emit = defineEmits(['questCompleted']);

const TARGET_ORDER = ['magenta', 'green', 'yellow', 'blue', 'orange'];

const slots = ref([null, null, null, null, null]);
const bankPieces = ref(['yellow', 'blue', 'magenta', 'orange', 'green']);

// countdown timer state (starts when first piece is placed)
const TIMER_DURATION_MS = 18000;
const TICK_MS = 10;
const timerActive = ref(false);
const timeLeftMs = ref(0);
let timerIntervalId = null;

function colorToCss(color) {
    if (color === 'magenta') return '#ff00ff';
    if (color === 'blue') return '#2196f3';
    if (color === 'green') return '#4caf50';
    if (color === 'yellow') return '#ffeb3b';
    if (color === 'orange') return '#ff9800';
    return '#888888';
}

function handleDragStartFromBank(color, event) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(
        'text/plain',
        JSON.stringify({ source: 'bank', color })
    );
}

function handleDragStartFromSlot(slotIndex, color, event) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(
        'text/plain',
        JSON.stringify({ source: 'slot', slotIndex, color })
    );
}

function handleDropOnSlot(targetIndex, event) {
    const payload = safeParse(event.dataTransfer.getData('text/plain'));
    if (!payload || !payload.color) return;

    const prevFilledCount = slots.value.filter((c) => !!c).length;

    if (payload.source === 'bank') {
        const current = slots.value[targetIndex];
        if (current) {
            bankPieces.value.push(current);
        }
        slots.value[targetIndex] = payload.color;
        bankPieces.value = bankPieces.value.filter((c) => c !== payload.color);
    } else if (payload.source === 'slot') {
        const fromIndex = payload.slotIndex;
        if (fromIndex === targetIndex) return;

        const targetColor = slots.value[targetIndex];
        slots.value[targetIndex] = payload.color;
        slots.value[fromIndex] = targetColor || null;
    }

    const currentFilledCount = slots.value.filter((c) => !!c).length;
    if (prevFilledCount === 0 && currentFilledCount > 0 && !timerActive.value) {
        startTimer();
    }
}

function handleDropOnBank(event) {
    const payload = safeParse(event.dataTransfer.getData('text/plain'));
    if (!payload || payload.source !== 'slot') return;

    const fromIndex = payload.slotIndex;
    const color = slots.value[fromIndex];
    if (!color) return;

    bankPieces.value.push(color);
    slots.value[fromIndex] = null;

    // if all slots are now empty, stop/reset the timer
    if (slots.value.every((c) => !c)) {
        resetTimer();
    }
}

const progressPercent = computed(() => {
    const correctCount = slots.value.reduce((count, color, index) => {
        return count + (color && color === TARGET_ORDER[index] ? 1 : 0);
    }, 0);
    return Math.round((correctCount / TARGET_ORDER.length) * 100);
});

const timePercent = computed(() => Math.round((Math.max(0, timeLeftMs.value) / TIMER_DURATION_MS) * 100));

const isCompleted = computed(() => slots.value.every((c, i) => c && c === TARGET_ORDER[i]));

watch(isCompleted, async (val) => {
    if (val) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        emit('questCompleted');
    }
});

watch(progressPercent, (val) => {
    if (val === 100) {
        resetTimer();
    }
});

function safeParse(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}

function clearBoard() {
    const colorsToReturn = slots.value.filter((c) => !!c);
    if (colorsToReturn.length) {
        bankPieces.value.push(...colorsToReturn);
    }
    slots.value = Array(TARGET_ORDER.length).fill(null);
    resetTimer();
}

function startTimer() {
    timerActive.value = true;
    timeLeftMs.value = TIMER_DURATION_MS;
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => {
        timeLeftMs.value = Math.max(0, timeLeftMs.value - TICK_MS);
        if (timeLeftMs.value <= 0) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
            timerActive.value = false;
            clearBoard();
        }
    }, TICK_MS);
}

function resetTimer() {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
    timerActive.value = false;
    timeLeftMs.value = 0;
}
</script>

<style scoped>
.quest2 {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 24px;
}

.slots-section,
.bank-section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
}

.slots-section-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
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

.piece {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    /* background: rgba(255, 255, 255, 0.1); */
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(20px) !important;
    /* box-shadow: 0 6px 18px rgba(0, 0, 0, 0.9); */
    cursor: grab;
    /* position: relative; */
    /* overflow: hidden; */
    /* backdrop-filter: blur(20px); */

    /* &::after {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        width: 100%;
        height: 100%;
        z-index: 21;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%);
        border-radius: 50%;
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
    } */
}
</style>