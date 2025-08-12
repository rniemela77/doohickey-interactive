<template>
    <div class="hand-drag">
        <!-- <svg viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.00024000000000000003" transform="rotate(0)matrix(1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.9120000000000001"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 3C13.2239 3 13 3.22386 13 3.5V12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12V5.5C11 5.22386 10.7761 5 10.5 5C10.2239 5 9.99999 5.22386 9.99999 5.5V13.9677C9.99999 15.0757 8.62655 15.5918 7.8969 14.7579L5.34951 11.8466C5.19167 11.6662 4.95459 11.576 4.71675 11.6057C4.15329 11.6761 3.88804 12.3395 4.24762 12.779L8.93807 18.5118C10.2266 20.0867 12.154 21 14.1888 21C17.3982 21 20 18.3982 20 15.1888V7.5C20 7.22386 19.7761 7 19.5 7C19.2239 7 19 7.22386 19 7.5V12C19 12.5523 18.5523 13 18 13C17.4477 13 17 12.5523 17 12V5.5C17 5.22386 16.7761 5 16.5 5C16.2239 5 16 5.22386 16 5.5V12C16 12.5523 15.5523 13 15 13C14.4477 13 14 12.5523 14 12V3.5C14 3.22386 13.7761 3 13.5 3ZM15.9611 3.05823C15.7525 1.88823 14.73 1 13.5 1C12.27 1 11.2475 1.88823 11.0389 3.05823C10.8653 3.0201 10.685 3 10.5 3C9.11928 3 7.99999 4.11929 7.99999 5.5V11.8386L6.85467 10.5296C6.2595 9.84942 5.36551 9.50903 4.46868 9.62113C2.34401 9.88672 1.34381 12.3883 2.6997 14.0455L7.39016 19.7783C9.05854 21.8174 11.5541 23 14.1888 23C18.5028 23 22 19.5028 22 15.1888V7.5C22 6.11929 20.8807 5 19.5 5C19.315 5 19.1347 5.0201 18.9611 5.05823C18.7525 3.88823 17.73 3 16.5 3C16.315 3 16.1347 3.0201 15.9611 3.05823Z" fill="#ffffff"></path> </g></svg> -->

        <div
            ref="trackpadElementRef"
            class="track-pad"
            :class="{ dragging: isDragging, disabled: disabled }"
            :style="{ backgroundPosition: backgroundPosition }"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { defineEmits } from 'vue'

const props = defineProps({
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['controlPositionChange'])

const trackpadElementRef = ref(null)

const isDragging = ref(false)

const controlSpeed = ref(0.03)

// Pointer positions
const startPointerClientX = ref(0)
const startPointerClientY = ref(0)
const currentPointerClientX = ref(0)
const currentPointerClientY = ref(0)

// Animation state
const animationFrameId = ref(0)
const lastAnimationTimestampMs = ref(0)

// Tuning constants
const backgroundTileSizePx = 20 // must match CSS background-size
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
    if (!isDragging.value) return

    const dtSeconds = Math.max(0, (timestampMs - lastAnimationTimestampMs.value) / 1000)
    lastAnimationTimestampMs.value = timestampMs

    const displacementX = currentPointerClientX.value - startPointerClientX.value
    const displacementY = currentPointerClientY.value - startPointerClientY.value

    // Velocity opposite to displacement
    const velocityX = -displacementX * velocityGain // px/s
    const velocityY = -displacementY * velocityGain // px/s

    backgroundOffsetX.value = normalizeOffset(backgroundOffsetX.value + velocityX * dtSeconds)
    backgroundOffsetY.value = normalizeOffset(backgroundOffsetY.value + velocityY * dtSeconds)

    // update the control position (scaled by time and configurable gain)
    controlPosition.value.x = controlPosition.value.x + velocityX * controlSpeed.value * dtSeconds
    controlPosition.value.y = controlPosition.value.y + velocityY * controlSpeed.value * dtSeconds

    // control position must be between -100 and 100 (keep internal high precision)
    controlPosition.value.x = Math.max(-100, Math.min(controlPosition.value.x, 100))
    controlPosition.value.y = Math.max(-100, Math.min(controlPosition.value.y, 100))

    // emit raw values for smooth consumers
    emit('controlPositionChange', { x: controlPosition.value.x, y: controlPosition.value.y })

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


// this is the position that the app will use to control the wave chart
const controlPosition = ref({ x: 0, y: 0 })
</script>

<style scoped>
.track-pad {
    height: 15rem;
    width: 15rem;

    /* repeating css pattern */
    background-color: #2A2A2C;
    opacity: 0.8;
    background-image: radial-gradient(#9EA2F16C 1px, #34343A 0.5px);
    background-size: 20px 20px;
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
</style>