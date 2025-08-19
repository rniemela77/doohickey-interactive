<template>
	<div class="slots-bank-container" :style="panelStyle">
		<div class="slots-section" :class="{ locked: isCompleted }" @dragover.prevent>
			<div v-for="(slotColor, slotIndex) in slots" :key="`slot-${slotIndex}`" class="slot"
				:class="{ filled: !!slotColor, correct: slotColor && slotColor === TARGET_ORDER[slotIndex] }"
				@dragover.prevent @drop="handleDropOnSlot(slotIndex, $event)">
				<ColorPiece v-if="slotColor" :color="slotColor" :disabled="isCompleted"
					@dragstart="(e) => handleDragStartFromSlot(slotIndex, slotColor, e)" />
			</div>
		</div>

		<div class="bank-section" :class="{ locked: isCompleted }" @dragover.prevent @drop="handleDropOnBank($event)">
			<ColorPiece v-for="(color, idx) in bankPieces" :key="`bank-${idx}-${color}`" :color="color"
				:disabled="isCompleted" @dragstart="(e) => handleDragStartFromBank(color, e)">
				<HandDrag class="pulse-fade" style="opacity: 0.6; width: 24px; height: 24px;" />
			</ColorPiece>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits, defineExpose } from 'vue';
import ColorPiece from './ColorPiece.vue';
import HandDrag from '../icons/HandDrag.vue';

const props = defineProps({
	panelStyle: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['started', 'emptied', 'completed']);

const TARGET_ORDER = ['magenta', 'green', 'yellow', 'blue', 'orange'];
const INITIAL_BANK = ['yellow', 'blue', 'magenta', 'orange', 'green'];

const DND_MIME = 'text/plain';
const DND_SOURCE = { bank: 'bank', slot: 'slot' };

const slots = ref(Array(TARGET_ORDER.length).fill(null));
const bankPieces = ref([...INITIAL_BANK]);

const isCompleted = computed(() => slots.value.every((c, i) => c && c === TARGET_ORDER[i]));

watch(isCompleted, (val) => {
	if (val) emit('completed');
});

function handleDragStartFromBank(color, event) {
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData(
		DND_MIME,
		JSON.stringify({ source: DND_SOURCE.bank, color })
	);
}

function handleDragStartFromSlot(slotIndex, color, event) {
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData(
		DND_MIME,
		JSON.stringify({ source: DND_SOURCE.slot, slotIndex, color })
	);
}

function handleDropOnSlot(targetIndex, event) {
	const payload = safeParse(event.dataTransfer.getData(DND_MIME));
	if (!payload || !payload.color) return;

	const hadZeroFilledBefore = isBoardEmpty();

	if (payload.source === DND_SOURCE.bank) {
		const current = slots.value[targetIndex];
		if (current) bankPieces.value.push(current);
		slots.value[targetIndex] = payload.color;
		removeFirst(bankPieces, payload.color);
	} else if (payload.source === DND_SOURCE.slot) {
		const fromIndex = payload.slotIndex;
		if (fromIndex === targetIndex) return;
		const targetColor = slots.value[targetIndex];
		slots.value[targetIndex] = payload.color;
		slots.value[fromIndex] = targetColor || null;
	}

	const hasAnyFilledNow = slots.value.some((c) => !!c);
	if (hadZeroFilledBefore && hasAnyFilledNow) emit('started');
}

function handleDropOnBank(event) {
	const payload = safeParse(event.dataTransfer.getData(DND_MIME));
	if (!payload || payload.source !== DND_SOURCE.slot) return;

	const fromIndex = payload.slotIndex;
	const color = slots.value[fromIndex];
	if (!color) return;

	bankPieces.value.push(color);
	slots.value[fromIndex] = null;

	if (isBoardEmpty()) emit('emptied');
}

function clearBoard() {
	const colorsToReturn = slots.value.filter((c) => !!c);
	if (colorsToReturn.length) bankPieces.value.push(...colorsToReturn);
	slots.value = Array(TARGET_ORDER.length).fill(null);
}

function safeParse(str) {
	try {
		return JSON.parse(str);
	} catch {
		return null;
	}
}

function isBoardEmpty() {
	return slots.value.every((c) => !c);
}

function removeFirst(arrayRef, value) {
	const index = arrayRef.value.indexOf(value);
	if (index !== -1) arrayRef.value.splice(index, 1);
}

defineExpose({ clearBoard });
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
</style>


