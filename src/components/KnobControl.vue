    <template>
        <div class="knob-control">
            <div class="knob-control-label">
                <span>{{ label }}</span>

                <div class="knob-container">
                    <div class="knob-value">{{ displayValue }}</div>

                    <div ref="knobEl" class="knob" :class="{ dragging: isDragging }"
                        :style="{ transform: `rotate(${knobDegrees}deg)` }" @pointerdown="onPointerDown">
                        <div class="knob-handle"></div>
                    </div>
                </div>
            </div>
        </div>
    </template>

<script setup>
import { ref, onBeforeUnmount, computed, watch, onMounted } from 'vue'

const props = defineProps({
    min: {
        type: Number,
        required: true
    },
    max: {
        type: Number,
        required: true
    },
    step: {
        type: Number,
        required: true
    },
    // v-model
    modelValue: {
        type: Number,
        default: undefined
    },
    label: {
        type: String,
        default: ''
    }
})

// rotation in degrees, 0..360 bounded
const knobDegrees = ref(0)
const emit = defineEmits(['update:modelValue'])

// Tune how fast the knob moves: degrees per pixel
const sensitivity = ref(1.2) // try 0.6–1.2 to taste

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

    // Map degrees -> continuous value. Emit raw during drag for smooth feel;
    // snap to step on pointer up.
    const raw = degreesToValue(knobDegrees.value)
    const clamped = clamp(raw, props.min, props.max)
    emit('update:modelValue', clamped)

    lastX = e.clientX
    lastY = e.clientY
}

const onPointerUp = (e) => {
    isDragging.value = false
    knobEl.value.releasePointerCapture?.(e.pointerId)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)

    // Snap to step on release and sync rotation to snapped value
    const snapped = clamp(quantizeToStep(degreesToValue(knobDegrees.value)), props.min, props.max)
    emit('update:modelValue', snapped)
    knobDegrees.value = valueToDegrees(snapped)
}

onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
})

// Helpers
function clamp(value, min, max) {
    if (value < min) return min
    if (value > max) return max
    return value
}

function valueToDegrees(value) {
    const span = props.max - props.min
    if (span <= 0) return 0
    const ratio = (clamp(value, props.min, props.max) - props.min) / span
    return ratio * 360
}

function degreesToValue(degrees) {
    const span = props.max - props.min
    const ratio = clamp(degrees, 0, 360) / 360
    return props.min + ratio * span
}

function quantizeToStep(value) {
    const step = props.step > 0 ? props.step : 1
    const stepsFromMin = Math.round((value - props.min) / step)
    return props.min + stepsFromMin * step
}

// Sync initial/internal degrees from external modelValue
onMounted(() => {
    const initial = typeof props.modelValue === 'number' ? props.modelValue : props.min
    const clamped = clamp(quantizeToStep(initial), props.min, props.max)
    knobDegrees.value = valueToDegrees(clamped)
    if (initial !== clamped) {
        emit('update:modelValue', clamped)
    }
})

watch(() => props.modelValue, (newValue) => {
    // Keep rotation smooth while dragging; ignore external snaps
    if (isDragging.value) return
    if (typeof newValue !== 'number') return
    const nextDeg = valueToDegrees(newValue)
    // Avoid tiny jitter loops by only updating if there's a meaningful change
    if (Math.abs(nextDeg - knobDegrees.value) > 0.01) {
        knobDegrees.value = nextDeg
    }
})

// Display formatting based on step precision
const displayValue = computed(() => {
    const decimals = getStepDecimalPlaces(props.step)
    const value = typeof props.modelValue === 'number' ? clamp(quantizeToStep(props.modelValue), props.min, props.max) : props.min
    const valueNum = typeof value === 'number' ? value : Number(value)
    return valueNum.toFixed(decimals)
})

function getStepDecimalPlaces(step) {
    if (!isFinite(step) || step <= 0) return 0
    const s = step.toString()
    const dot = s.indexOf('.')
    return dot === -1 ? 0 : (s.length - dot - 1)
}
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