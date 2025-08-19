<template>
	<div class="piece" :style="{ background: colorToCss(color) }" :draggable="!disabled" @dragstart="onDragStart">
		<slot />
	</div>
</template>

<script setup>
const props = defineProps({
	color: { type: String, required: true },
	disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['dragstart']);

const COLOR_TO_HEX = {
	magenta: '#ff00ff',
	blue: '#2196f3',
	green: '#4caf50',
	yellow: '#ffeb3b',
	orange: '#ff9800'
};

function colorToCss(color) {
	return COLOR_TO_HEX[color] || '#888888';
}

function onDragStart(event) {
	emit('dragstart', event);
}
</script>

<style scoped>
.piece {
	width: 72px;
	height: 72px;
	border-radius: 50%;
	border: 1px solid rgba(255, 255, 255, 0.3);
	cursor: grab;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>


