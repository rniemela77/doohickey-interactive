<template>
	<div class="slots-bank-container" :style="panelStyle">
		<div class="slots-section" :class="{ locked: isCompleted }">
			<div v-for="(slotColor, slotIndex) in slots" :key="`slot-${slotIndex}`" class="slot"
				:class="{ filled: !!slotColor, correct: slotColor && slotColor === TARGET_ORDER[slotIndex], hover: hoverSlotIndex === slotIndex }"
				:ref="(el) => setSlotRef(el, slotIndex)">
				<ColorPiece v-if="slotColor && !(dragState.active && dragState.source === DND_SOURCE.slot && dragState.fromIndex === slotIndex)"
					:color="slotColor" :disabled="isCompleted"
					@pointerdown.prevent="(e) => handlePointerDownFromSlot(slotIndex, slotColor, e)" />
			</div>
		</div>

		<div class="bank-section" :class="{ locked: isCompleted }" ref="bankRef">
			<ColorPiece v-for="(color, idx) in bankPieces" :key="`bank-${idx}-${color}`" :color="color"
				:disabled="isCompleted"
				v-show="!(dragState.active && dragState.source === DND_SOURCE.bank && dragState.fromIndex === idx && dragState.color === color)"
				@pointerdown.prevent="(e) => handlePointerDownFromBank(idx, color, e)">
				<HandDrag class="pulse-fade" style="opacity: 0.6; width: 24px; height: 24px;" />
			</ColorPiece>
		</div>

		<!-- Drag ghost -->
		<div v-if="dragState.active" class="drag-ghost" :style="ghostStyle"></div>
	</div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits, defineExpose, onBeforeUnmount } from 'vue';
import ColorPiece from './ColorPiece.vue';
import HandDrag from '../icons/HandDrag.vue';

const props = defineProps({
	panelStyle: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['started', 'emptied', 'completed']);

const TARGET_ORDER = ['magenta', 'green', 'yellow', 'blue', 'orange'];
const INITIAL_BANK = ['yellow', 'blue', 'magenta', 'orange', 'green'];

const DND_SOURCE = { bank: 'bank', slot: 'slot' };

const slots = ref(Array(TARGET_ORDER.length).fill(null));
const bankPieces = ref([...INITIAL_BANK]);

const isCompleted = computed(() => slots.value.every((c, i) => c && c === TARGET_ORDER[i]));

watch(isCompleted, (val) => {
	if (val) emit('completed');
});

// Pointer-based dragging state
const dragState = ref({
	active: false,
	source: null,
	fromIndex: null,
	color: null,
	x: 0,
	y: 0,
	offsetX: 36,
	offsetY: 36
});

const hoverSlotIndex = ref(null);

const slotRefs = ref([]);
const bankRef = ref(null);

function setSlotRef(el, index) {
	if (!el) return;
	slotRefs.value[index] = el;
}

function handlePointerDownFromBank(index, color, event) {
	startDrag({ source: DND_SOURCE.bank, fromIndex: index, color }, event);
}

function handlePointerDownFromSlot(slotIndex, color, event) {
	startDrag({ source: DND_SOURCE.slot, fromIndex: slotIndex, color }, event);
}

function startDrag({ source, fromIndex, color }, event) {
	const rect = event.currentTarget.getBoundingClientRect();
	dragState.value = {
		active: true,
		source,
		fromIndex,
		color,
		x: event.clientX,
		y: event.clientY,
		offsetX: event.clientX - (rect.left + rect.width / 2),
		offsetY: event.clientY - (rect.top + rect.height / 2)
	};
	window.addEventListener('pointermove', onPointerMove, { passive: false });
	window.addEventListener('pointerup', onPointerUp, { passive: false });
}

function onPointerMove(event) {
	if (!dragState.value.active) return;
	dragState.value.x = event.clientX;
	dragState.value.y = event.clientY;
	// Update hover slot
	hoverSlotIndex.value = findSlotIndexAt(event.clientX, event.clientY);
}

function onPointerUp(event) {
	if (!dragState.value.active) return;
	const ds = dragState.value;
	const targetSlot = findSlotIndexAt(event.clientX, event.clientY);
	const overBank = isOverBank(event.clientX, event.clientY);

	const hadZeroFilledBefore = isBoardEmpty();

	if (targetSlot != null) {
		if (ds.source === DND_SOURCE.bank) {
			const current = slots.value[targetSlot];
			if (current) bankPieces.value.push(current);
			slots.value[targetSlot] = ds.color;
			// Remove the dragged bank piece by its original index when possible to avoid removing wrong duplicate
			if (typeof ds.fromIndex === 'number' && bankPieces.value[ds.fromIndex] === ds.color) {
				bankPieces.value.splice(ds.fromIndex, 1);
			} else {
				removeFirst(bankPieces, ds.color);
			}
		} else if (ds.source === DND_SOURCE.slot) {
			const fromIndex = ds.fromIndex;
			if (fromIndex !== targetSlot) {
				const targetColor = slots.value[targetSlot];
				slots.value[targetSlot] = ds.color;
				slots.value[fromIndex] = targetColor || null;
			}
		}

		const hasAnyFilledNow = slots.value.some((c) => !!c);
		if (hadZeroFilledBefore && hasAnyFilledNow) emit('started');
	} else if (overBank && ds.source === DND_SOURCE.slot) {
		const fromIndex = ds.fromIndex;
		const color = slots.value[fromIndex];
		if (color) {
			bankPieces.value.push(color);
			slots.value[fromIndex] = null;
			if (isBoardEmpty()) emit('emptied');
		}
	}

	cleanupDrag();
}

function cleanupDrag() {
	hoverSlotIndex.value = null;
	dragState.value = { active: false, source: null, fromIndex: null, color: null, x: 0, y: 0, offsetX: 36, offsetY: 36 };
	window.removeEventListener('pointermove', onPointerMove);
	window.removeEventListener('pointerup', onPointerUp);
}

function findSlotIndexAt(x, y) {
	for (let i = 0; i < slotRefs.value.length; i++) {
		const el = slotRefs.value[i];
		if (!el) continue;
		const r = el.getBoundingClientRect();
		if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
	}
	return null;
}

function isOverBank(x, y) {
	const el = bankRef.value;
	if (!el) return false;
	const r = el.getBoundingClientRect();
	return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
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

// Ghost style computed
const COLOR_TO_HEX = {
	magenta: '#ff00ff',
	blue: '#2196f3',
	green: '#4caf50',
	yellow: '#ffeb3b',
	orange: '#ff9800'
};

const ghostStyle = computed(() => {
	if (!dragState.value.active) return {};
	const size = 72;
	return {
		position: 'fixed',
		left: `${dragState.value.x - dragState.value.offsetX - size / 2}px`,
		top: `${dragState.value.y - dragState.value.offsetY - size / 2}px`,
		width: `${size}px`,
		height: `${size}px`,
		borderRadius: '50%',
		border: '1px solid rgba(255, 255, 255, 0.3)',
		background: COLOR_TO_HEX[dragState.value.color] || '#888888',
		pointerEvents: 'none',
		boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
		zIndex: 9999
	};
});

onBeforeUnmount(() => {
	cleanupDrag();
});
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

	&.hover {
		border-color: #ffffff;
		opacity: 1;
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

.drag-ghost { display: block; }
</style>


