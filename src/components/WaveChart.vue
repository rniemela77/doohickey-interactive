<template>
    <div class="wave-chart">
        <div class="left-border"></div>
        <div class="right-border"></div>
        <div class="top-border"></div>
        <div class="bottom-border"></div>

        <svg width="100%" height="100%" viewBox="0 0 300 200" class="wave-svg">

            <!-- Wave 1 - Red -->
            <path class="wave wave1" :d="wave1Path" fill="none" :style="{
                opacity: 1 - (Math.abs(props.controlPosition.x - props.goalPosition.x) / 50),
            }" />

            <!-- Wave 2 - Green -->
            <path class="wave wave2" :d="wave2Path" fill="none"
                :style="{ opacity: 1 - (Math.abs(props.controlPosition.y - props.goalPosition.y) / 50) }" />

            <!-- Wave 3 - Blue -->
            <path class="wave wave3" :d="wave3Path" fill="none" />
        </svg>
    </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// props
const props = defineProps({
    controlPosition: {
        type: Object,
        required: true
    },
    goalPosition: {
        type: Object,
        required: true
    },
    speed: {
        type: Number,
        default: 0.3
    }
})

const time = ref(0)

const goalAmplitude = 80
const goalFrequency = 0.02

// Wave 1 (Red) controls
// the further controlPosition.x is from goalPosition.x, the farther the amplitude is from 30
const wave1Amplitude = computed(() => goalAmplitude + (props.controlPosition.x - props.goalPosition.x))
// the further controlPosition.x is from goalPosition.x, the further the frequency is from 0.05
const wave1Frequency = computed(() => goalFrequency + ((props.controlPosition.x - props.goalPosition.x) * 0.0005))
// the further controlPosition.x is from goalPosition.x, the further the speed is from 0.1
const wave1Speed = computed(() => props.speed + ((props.controlPosition.x - props.goalPosition.x) * 0.0005))

// Wave 2 (Green) controls
// the further controlPosition.y is from goalPosition.y, the farther the amplitude is from 30
const wave2Amplitude = computed(() => goalAmplitude + (props.controlPosition.y - props.goalPosition.y))
// the further controlPosition.y is from goalPosition.y, the further the frequency is from 0.05
const wave2Frequency = computed(() => goalFrequency + ((props.controlPosition.y - props.goalPosition.y) * 0.0005))
// the further controlPosition.y is from goalPosition.y, the further the speed is from 0.1
const wave2Speed = computed(() => props.speed + ((props.controlPosition.y - props.goalPosition.y) * 0.0005))

// Wave 3 (Blue) controls
const wave3Amplitude = goalAmplitude
const wave3Frequency = goalFrequency
const wave3Speed = computed(() => props.speed)

// Generate sine wave paths
const wave1Path = computed(() => {
    // Start at the actual first y-value to avoid a vertical line from midpoint
    const y0 = 100 + Math.sin(0 * wave1Frequency.value + time.value * wave1Speed.value) * wave1Amplitude.value
    let path = `M 0 ${y0}`
    for (let x = 2; x <= 300; x += 2) {
        const y = 100 + Math.sin(x * wave1Frequency.value + time.value * wave1Speed.value) * wave1Amplitude.value
        path += ` L ${x} ${y}`
    }
    return path
})

const wave2Path = computed(() => {
    const y0 = 100 + Math.sin(0 * wave2Frequency.value + time.value * wave2Speed.value) * wave2Amplitude.value
    let path = `M 0 ${y0}`
    for (let x = 2; x <= 300; x += 2) {
        const y = 100 + Math.sin(x * wave2Frequency.value + time.value * wave2Speed.value) * wave2Amplitude.value
        path += ` L ${x} ${y}`
    }
    return path
})

const wave3Path = computed(() => {
    const y0 = 100 + Math.sin(0 * wave3Frequency + time.value * wave3Speed.value) * wave3Amplitude
    let path = `M 0 ${y0}`
    for (let x = 2; x <= 300; x += 2) {
        const y = 100 + Math.sin(x * wave3Frequency + time.value * wave3Speed.value) * wave3Amplitude
        path += ` L ${x} ${y}`
    }
    return path
})

// Animation loop
onMounted(() => {
    const animate = () => {
        time.value += 0.1
        requestAnimationFrame(animate)
    }
    animate()
})
</script>

<style scoped>
.wave-chart {
    width: 20rem;
    height: 20rem;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.8);
    padding: 1rem;
    position: relative;
    overflow: hidden;
}

.wave-svg {
    width: 100%;
    height: 100%;
}

.wave {
    animation: none;
    /* Remove the old animation */
}

.wave1 {
    filter: drop-shadow(0 0 5px #FF0000);
    stroke-width: 2;
    stroke: #FF0000;
}

.wave2 {
    filter: drop-shadow(0 0 5px #00AEFF);
    stroke-width: 2;
    stroke: #00AEFF;
}

.wave3 {
    filter: drop-shadow(0 0 5px #FFFFFF);
    stroke-width: 2;
    stroke: #FFFFFF;
}

.left-border,
.right-border,
.top-border,
.bottom-border {
    position: absolute;
    backdrop-filter: blur(10px);
}

.left-border {
    left: 0;
    top: 0;
    height: 100%;
    width: 30px;
}

.right-border {
    right: 0;
    top: 0;
    height: 100%;
    width: 30px;
}

.top-border {
    top: 0;
    left: 0;
    width: 100%;
    height: 30px;
}

.bottom-border {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
}
</style>