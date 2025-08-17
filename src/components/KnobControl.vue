    <template>
        <div class="knob-control">
            <div class="knob-control-label">
                <span>{{ knobLabel }}</span>

                <div class="knob-container">
                    <div class="knob-value">{{ Math.round(knobValue) }}</div>

                    <div ref="knobEl" class="knob" :class="{ dragging: isDragging }"
                        :style="{ transform: `rotate(${knobDegrees}deg)` }" @pointerdown="onPointerDown">
                        <div class="knob-handle"></div>
                    </div>
                </div>
            </div>
        </div>
    </template>

<script setup>
import { ref, onBeforeUnmount, computed } from 'vue'

const knobLabel = ref('Knob')
const knobDegrees = ref(180) // 0..360 bounded
const minValue = 0
const maxValue = 10
const knobValue = computed(() => (knobDegrees.value / 360) * (maxValue - minValue) + minValue)
const emit = defineEmits(['update:value'])

// Tune how fast the knob moves: degrees per pixel
const sensitivity = ref(0.3) // try 0.6–1.2 to taste

const knobEl = ref(null)
const isDragging = ref(false)

// last pointer position (screen coords)
let lastX = 0
let lastY = 0
let moved = false
const PIXEL_DEADZONE = 4 // ignore tiny jitter on click

const onPointerDown = (e) => {
    isDragging.value = true
    moved = false
    lastX = e.clientX
    lastY = e.clientY
    knobEl.value.setPointerCapture?.(e.pointerId)

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
}

const onPointerMove = (e) => {
    if (!isDragging.value) return

    const dx = e.clientX - lastX
    const dy = e.clientY - lastY

    if (!moved && Math.abs(dx) + Math.abs(dy) < PIXEL_DEADZONE) {
        // still just a click — do nothing
        return
    }
    moved = true

    // Up/right increases; down/left decreases:
    // - up is negative dy → subtracting dy adds when moving up
    // - right is positive dx → adds when moving right
    const deltaDeg = (dx - dy) * sensitivity.value

    let next = knobDegrees.value + deltaDeg
    if (next < 0) next = 0
    if (next > 360) next = 360
    knobDegrees.value = next

    // Emit logical value in 0..10 range as a rounded integer
    emit('update:value', Math.round(knobValue.value))

    lastX = e.clientX
    lastY = e.clientY
}

const onPointerUp = (e) => {
    isDragging.value = false
    knobEl.value.releasePointerCapture?.(e.pointerId)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
}

onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
})
</script>

<style scoped>
.knob-control {
    width: 100%;
    height: 100%;
}

.knob-control-label {
    display: inline-flex;
    flex-direction: column;
    gap: 8px;
}

.knob-container {
    position: relative;
    width: 100px;
    height: 100px;
}

.knob-value {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
    font-variant-numeric: tabular-nums;
}

.knob {
    width: 100px;
    height: 100px;
    background-color: transparent;
    border-radius: 50%;
    border: 1px solid red;
    transform-origin: center;
    transform: rotate(0deg);
    /* 0° at bottom (handle placed at bottom) */
    transition: transform 0.5s ease-in-out;
    touch-action: none;
    /* allow pointer drags */
    position: relative;
}

.knob.dragging {
    transition: none;
}

.knob-handle {
    position: absolute;
    left: 50%;
    bottom: 4%;
    /* notch at bottom for 0°/360° */
    transform: translateX(-50%);
    width: 6px;
    height: 12px;
    background-color: red;
    border-radius: 2px;
}
</style>