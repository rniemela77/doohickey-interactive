<template>
    <div class="wave-chart">
        <div class="left-border"></div>
        <div class="right-border"></div>
        <!-- <div class="top-border"></div>
        <div class="bottom-border"></div> -->

        <svg width="100%" height="100%" viewBox="0 0 300 200" class="wave-svg" preserveAspectRatio="none">
            <!-- Wave 1 - Red -->
            <g class="scroller" :style="{ '--duration': wave1Duration + 's', '--shift': wave1ShiftPercent + '%' }">
                <path class="wave wave1" :d="wave1Path" fill="none" />
            </g>

            <!-- Wave 2 - Green -->
            <g class="scroller" :style="{ '--duration': wave2Duration + 's', '--shift': wave2ShiftPercent + '%' }">
                <path class="wave wave2" :d="wave2Path" fill="none" />
            </g>

            <!-- Wave 3 - white -->
            <g class="scroller" :style="{ '--duration': wave3Duration + 's', '--shift': wave3ShiftPercent + '%' }">
                <path class="wave wave3" :d="wave3Path" fill="none" />
            </g>
        </svg>
    </div>

</template>

<script setup>
import { computed } from 'vue'

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

const chartWidth = 300
const midY = 100
const step = 2

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

// Wave 3 (White) controls
const wave3Amplitude = goalAmplitude
const wave3Frequency = goalFrequency
const wave3Speed = computed(() => props.speed)

// Utilities
const clampAbs = (value, minAbs) => {
    const abs = Math.abs(value)
    if (abs < minAbs) return value < 0 ? -minAbs : minAbs
    return value
}

const buildWavePath = (amplitude, frequency) => {
    const safeFreq = clampAbs(frequency, 0.0001)
    const period = (Math.PI * 2) / Math.abs(safeFreq)
    const totalWidth = chartWidth + period

    const y0 = midY + Math.sin(0 * safeFreq) * amplitude
    let path = `M 0 ${y0}`
    for (let x = step; x <= totalWidth; x += step) {
        const y = midY + Math.sin(x * safeFreq) * amplitude
        path += ` L ${x} ${y}`
    }
    return path
}

// Generate sine wave paths (static shape; motion via CSS translate)
const wave1Path = computed(() => buildWavePath(wave1Amplitude.value, wave1Frequency.value))
const wave2Path = computed(() => buildWavePath(wave2Amplitude.value, wave2Frequency.value))
const wave3Path = computed(() => buildWavePath(wave3Amplitude, wave3Frequency))

// CSS animation parameters
// To move by one period seamlessly: duration = 2π / speed; shift = period / chartWidth (% of viewBox width)
const wave1Duration = computed(() => (Math.PI * 2) / Math.max(0.0001, Math.abs(wave1Speed.value)))
const wave2Duration = computed(() => (Math.PI * 2) / Math.max(0.0001, Math.abs(wave2Speed.value)))
const wave3Duration = computed(() => (Math.PI * 2) / Math.max(0.0001, Math.abs(wave3Speed.value)))

const wave1ShiftPercent = computed(() => {
    const period = (Math.PI * 2) / Math.max(0.0001, Math.abs(wave1Frequency.value))
    const totalWidth = chartWidth + period
    return (period / totalWidth) * 100
})
const wave2ShiftPercent = computed(() => {
    const period = (Math.PI * 2) / Math.max(0.0001, Math.abs(wave2Frequency.value))
    const totalWidth = chartWidth + period
    return (period / totalWidth) * 100
})
const wave3ShiftPercent = computed(() => {
    const period = (Math.PI * 2) / Math.max(0.0001, Math.abs(wave3Frequency))
    const totalWidth = chartWidth + period
    return (period / totalWidth) * 100
})
</script>

<style scoped>
.wave-chart {
    width: 100%;
    height: 15rem;
    background: rgba(0, 0, 0, 0.8);
    position: relative;
    overflow: hidden;
}

.wave-svg {
    width: 100%;
    height: 100%;
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

.scroller {
    animation-name: wave-scroll;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-duration: var(--duration);
    transform-box: fill-box;
    transform-origin: 0 0;
}

@keyframes wave-scroll {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(calc(-1 * var(--shift)));
    }
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