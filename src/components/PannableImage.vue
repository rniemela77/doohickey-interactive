<template>
    <div class="pannable-image">
        <DistortionEffect :freqX="0.02" :freqY="0.015" :scale="50">
            <img :src="src" width="150px" :style="{ transform: imgTransform, cursor: isDragging ? 'grabbing' : 'grab' }"
                @mousedown="startDrag" @touchstart="startDrag" @touchmove.prevent draggable="false" />
        </DistortionEffect>

        <button class="reset-btn" @click="resetImage">RESET</button>
    </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import DistortionEffect from './DistortionEffect.vue';

const props = defineProps({
    src: {
        type: String,
        required: true
    }
})

const isDragging = ref(false);

// Image drag-to-pan control
const imgTranslatePercentX = ref(50);
const imgTranslatePercentY = ref(0);
const imgTransform = computed(
    () => `translateX(${imgTranslatePercentX.value}%) translateY(${imgTranslatePercentY.value}%) scale(2)`
);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragStartTranslateX = ref(0);
const dragStartTranslateY = ref(0);

const startDrag = (event) => {
    event.preventDefault();
    isDragging.value = true;

    let clientX, clientY;
    if (event.type === 'touchstart') {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    dragStartX.value = clientX;
    dragStartY.value = clientY;
    dragStartTranslateX.value = imgTranslatePercentX.value;
    dragStartTranslateY.value = imgTranslatePercentY.value;

    // Add global event listeners
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
};

const onDrag = (event) => {
    if (!isDragging.value) return;

    let clientX, clientY;
    if (event.type === 'touchmove') {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const deltaX = clientX - dragStartX.value;
    const deltaY = clientY - dragStartY.value;

    // Convert pixel movement to percentage (adjust sensitivity as needed)
    const sensitivity = 0.5; // pixels to percentage ratio
    imgTranslatePercentX.value = dragStartTranslateX.value + (deltaX * sensitivity);
    imgTranslatePercentY.value = dragStartTranslateY.value + (deltaY * sensitivity);
};

const endDrag = () => {
    isDragging.value = false;

    // Remove global event listeners
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
};

const resetImage = () => {
    imgTranslatePercentX.value = 50;
    imgTranslatePercentY.value = 0;
};

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
});
</script>

<style scoped>
img {
    z-index: 3;
}

.reset-btn {
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    z-index: 100;
    position: absolute;
    top: 0;
    left: 0;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
    }
}
</style>