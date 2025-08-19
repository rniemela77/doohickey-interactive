<template>
    <div class="hand-drag">
        <div ref="trackpadElementRef" class="track-pad" :class="{ dragging: isDragging, disabled: disabled }"
            :style="{ backgroundPosition: backgroundPosition }" @pointerdown="onPointerDown"
            @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp">

            <HandIcon v-if="!disabled" :style="{ opacity: !isDragging ? 1 : 0.1 }" class="hand-drag-icon pulse-fade" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { defineEmits } from 'vue'
import HandIcon from '../icons/HandDrag.vue'

const props = defineProps({
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['controlDelta'])

const trackpadElementRef = ref(null)

const isDragging = ref(false)

// Pointer positions
const startPointerClientX = ref(0)
const startPointerClientY = ref(0)
const currentPointerClientX = ref(0)
const currentPointerClientY = ref(0)

// Animation state
const animationFrameId = ref(0)
const lastAnimationTimestampMs = ref(0)

// Tuning constants
const backgroundTileSizePx = 40 // must match CSS background-size
const velocityGain = 3 // px/s per px of displacement

// Background offset within one tile for stability
const backgroundOffsetX = ref(0)
const backgroundOffsetY = ref(0)

const normalizeOffset = (value) => {
    const modulo = ((value % backgroundTileSizePx) + backgroundTileSizePx) % backgroundTileSizePx
    return modulo
}

const backgroundPosition = computed(() => `${backgroundOffsetX.value}px ${backgroundOffsetY.value}px`)

const step = (timestampMs) => {
    if (!isDragging.value || props.disabled) return

    const dtSeconds = Math.max(0, (timestampMs - lastAnimationTimestampMs.value) / 1000)
    lastAnimationTimestampMs.value = timestampMs

    const displacementX = currentPointerClientX.value - startPointerClientX.value
    const displacementY = currentPointerClientY.value - startPointerClientY.value

    // Velocity opposite to displacement
    const velocityX = -displacementX * velocityGain // px/s
    const velocityY = -displacementY * velocityGain // px/s

    backgroundOffsetX.value = normalizeOffset(backgroundOffsetX.value + velocityX * dtSeconds)
    backgroundOffsetY.value = normalizeOffset(backgroundOffsetY.value + velocityY * dtSeconds)

    // Emit velocity and dt; parent decides how to integrate and clamp
    emit('controlDelta', { vx: velocityX, vy: velocityY, dt: dtSeconds })

    animationFrameId.value = requestAnimationFrame(step)
}

const onPointerDown = (event) => {
    isDragging.value = true
    startPointerClientX.value = event.clientX
    startPointerClientY.value = event.clientY
    currentPointerClientX.value = event.clientX
    currentPointerClientY.value = event.clientY

    lastAnimationTimestampMs.value = performance.now()
    animationFrameId.value = requestAnimationFrame(step)

    // Ensure we continue receiving move events even if the pointer leaves the element
    try {
        event.currentTarget?.setPointerCapture?.(event.pointerId)
    } catch (_) {
        // no-op
    }
}

const onPointerMove = (event) => {
    if (!isDragging.value) return
    currentPointerClientX.value = event.clientX
    currentPointerClientY.value = event.clientY
}

const onPointerUp = (event) => {
    isDragging.value = false
    if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = 0
    try {
        event.currentTarget?.releasePointerCapture?.(event.pointerId)
    } catch (_) {
        // no-op
    }
}


</script>

<style scoped>
.hand-drag {
    width: 100%;
    height: 100%;
    min-width: 15rem;
    min-height: 15rem;
    position: relative;
}

.track-pad {
    width: 100%;
    height: 100%;
    position: absolute;


    /* repeating css pattern */
    background-color: #2A2A2C;
    opacity: 0.8;
    background-image: radial-gradient(#9EA2F16C 2px, #34343A 0.5px);
    background-size: 40px 40px;
    background-repeat: repeat;

    /* interaction */
    cursor: grab;
    touch-action: none;
}

.track-pad.dragging {
    cursor: grabbing;
}

.track-pad.disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.hand-drag-icon {
    pointer-events: none;
    position: absolute;
    top: 25%;
    left: 25%;
    width: 50%;
    height: 50%;
    z-index: 100;
}
</style>