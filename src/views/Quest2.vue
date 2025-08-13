<template>
    <div class="quest2">
        <div class="slots" @dragover.prevent>
            <div
                v-for="(slotColor, slotIndex) in slots"
                :key="`slot-${slotIndex}`"
                class="slot"
                :class="{ filled: !!slotColor }"
                @dragover.prevent
                @drop="handleDropOnSlot(slotIndex, $event)"
            >
                <div
                    v-if="slotColor"
                    class="piece"
                    :style="{ background: colorToCss(slotColor) }"
                    draggable="true"
                    @dragstart="handleDragStartFromSlot(slotIndex, slotColor, $event)"
                />
            </div>
        </div>

        <div class="bank" @dragover.prevent @drop="handleDropOnBank($event)">
            <div
                v-for="(color, idx) in bankPieces"
                :key="`bank-${color}`"
                class="piece"
                :style="{ background: colorToCss(color) }"
                draggable="true"
                @dragstart="handleDragStartFromBank(color, $event)"
            />
        </div>

        <div v-if="isCorrect" class="message">correct!</div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const TARGET_ORDER = ['magenta', 'blue', 'green'];

const slots = ref([null, null, null]);
const bankPieces = ref(['magenta', 'blue', 'green']);

function colorToCss(color) {
    if (color === 'magenta') return 'radial-gradient(circle at 30% 30%, #ff00ff -50%, #000000 100%)';
    if (color === 'blue') return '#2196f3';
    if (color === 'green') return '#4caf50';
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
}

function handleDropOnBank(event) {
    const payload = safeParse(event.dataTransfer.getData('text/plain'));
    if (!payload || payload.source !== 'slot') return;

    const fromIndex = payload.slotIndex;
    const color = slots.value[fromIndex];
    if (!color) return;

    bankPieces.value.push(color);
    slots.value[fromIndex] = null;
}

const isCorrect = computed(() => {
    if (slots.value.some((c) => !c)) return false;
    return slots.value.every((c, i) => c === TARGET_ORDER[i]);
});

function safeParse(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}
</script>

<style scoped>
.quest2 {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}

.slots {
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
}

.slot.filled {
    border-style: solid;
}

.bank {
    display: flex;
    gap: 16px;
    min-height: 96px;
    align-items: center;
    border: 1px solid red;
    padding: 16px;
    border-radius: 16px;
    min-width: 100%;
}

.piece {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
    cursor: grab;
}

.message {
    font-size: 20px;
    color: #9cff9c;
}
</style>