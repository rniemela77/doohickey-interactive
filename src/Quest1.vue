<template>
    <div class="quest1">
        <div class="quest1-title">
            <h1>Power up the signal</h1>
        </div>

        <div class="control-panel">
            <WaveChart :control-position="controlPosition" :goal-position="goalPosition" />

            x:{{ controlPosition.x }} y:{{ controlPosition.y }}

            <TrackPad @controlPositionChange="handleControlPositionChange" :disabled="isFinished" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import WaveChart from './components/WaveChart.vue'
import TrackPad from './components/TrackPad.vue'

const controlPosition = ref({ x: 0, y: 0 })
const goalPosition = ref({ x: -30, y: 30 })

const handleControlPositionChange = (newPosition) => {
    controlPosition.value = newPosition
}


let isFinished = ref(false)
const goalTotal = 25;
// every 100ms, check if the control position is within 5px of the goal position
const checkIfFinished = () => {
    if (isFinished.value) return;
    
    if (Math.abs(controlPosition.value.x - goalPosition.value.x) < goalTotal && Math.abs(controlPosition.value.y - goalPosition.value.y) < goalTotal) {
        isFinished.value = true
        console.log('finished!');

        // animate the control position to the goal position (ease over 3 seconds)
        const totalAnimationTime = 3000;
        const startTime = performance.now();
        const startX = controlPosition.value.x;
        const startY = controlPosition.value.y;

        const easeInOutCubic = (t) => (t < 0.5)
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const animate = (now) => {
            const elapsedTime = now - startTime;
            const t = Math.min(1, elapsedTime / totalAnimationTime);
            const p = easeInOutCubic(t);

            controlPosition.value.x = startX + (goalPosition.value.x - startX) * p;
            controlPosition.value.y = startY + (goalPosition.value.y - startY) * p;

            if (t < 1) {
                requestAnimationFrame(animate)
            } else {
                // snap exactly to goal at the end
                controlPosition.value.x = goalPosition.value.x;
                controlPosition.value.y = goalPosition.value.y;
            }
        }
        requestAnimationFrame(animate)
    }
}

setInterval(checkIfFinished, 100)
</script>

<style scoped>
.quest1 {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.quest1-title {
    margin-bottom: 2rem;
}

.quest1-title h1 {
    color: #00ff00;
    text-shadow: 0 0 10px #00ff00;
    font-family: 'Courier New', monospace;
}

.control-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
}
</style>