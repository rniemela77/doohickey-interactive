<template>
    <div class="quest1">
        <div class="control-panel">
            <div class="border">
                <span class="text-xs">SIGNAL FREQUENCY</span>

                <WaveChart :control-position="controlPosition" :goal-position="goalPosition" :speed="speed" />

                <span class="seven-segment text-xs d-flex text-red">
                    <span class="flex-1">
                        TSRF:
                        [ <span :class="{ 'text-white': Math.abs(goalPosition.x - controlPosition.x) < 1 }">
                            {{ Math.round(controlPosition.x - 25) * 3 }}</span> ]
                    </span>
                    <span class="flex-1">
                        PPU: [ <span :class="{ 'text-white': Math.abs(goalPosition.y - controlPosition.y) < 1 }">{{
                            Math.round(controlPosition.y - 25) * 900 }}</span> ]
                    </span>
                </span>
            </div>

            <div class="border trackpad-border">
                <TrackPad @controlDelta="handleControlDelta" :disabled="isFinished" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WaveChart from '../components/WaveChart.vue'
import TrackPad from '../components/TrackPad.vue'
import { useQuestStore } from '../composables/useQuestStore'
import { playSuccess } from '../helpers/sounds'

const { visibleMessages } = useQuestStore()

// Configuration object for easy maintenance
const QUEST_CONFIG = {
    goal: { x: -30, y: 30 },
    threshold: 3,
    checkInterval: 100,
    animation: {
        duration: 2000,
        maxSpeed: 1.5,
        initialSpeed: 0.3
    },
    timing: {
        waveChartDelay: 1000,
        trackPadDelay: 1000,
        finalDelay: 1000,
        goalAnimationDelay: 1000,
        completionDelay: 100
    },
}

// Animation utilities
const AnimationUtils = {
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2
    },

    async animateToGoal(startPosition, goalPosition, startSpeed, onUpdate, onComplete) {
        const startTime = performance.now()
        const { duration, maxSpeed } = QUEST_CONFIG.animation

        return new Promise((resolve) => {
            const animate = (now) => {
                const elapsedTime = now - startTime
                const progress = Math.min(1, elapsedTime / duration)
                const easedProgress = this.easeInOutCubic(progress)

                // Calculate current values
                const currentSpeed = startSpeed + (maxSpeed - startSpeed) * easedProgress
                const currentX = startPosition.x + (goalPosition.x - startPosition.x) * easedProgress
                const currentY = startPosition.y + (goalPosition.y - startPosition.y) * easedProgress

                // Update via callback
                onUpdate({ x: currentX, y: currentY }, currentSpeed)

                if (progress < 1) {
                    requestAnimationFrame(animate)
                } else {
                    // Ensure final values are exact
                    onUpdate(goalPosition, maxSpeed)
                    onComplete?.()
                    resolve()
                }
            }

            requestAnimationFrame(animate)
        })
    }
}

// Timing service for better async flow management
const TimingService = {
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    },

    async sequence(tasks) {
        for (const task of tasks) {
            await task()
        }
    }
}

// Reactive state
const controlPosition = ref({ x: 0, y: 0 })
const goalPosition = ref(QUEST_CONFIG.goal)
const speed = ref(QUEST_CONFIG.animation.initialSpeed)
const isFinished = ref(false)

const emit = defineEmits(['questCompleted'])

// Computed properties
const isWithinGoalRange = computed(() => {
    const { x, y } = controlPosition.value
    const goal = goalPosition.value
    const threshold = QUEST_CONFIG.threshold

    return Math.abs(x - goal.x) < threshold && Math.abs(y - goal.y) < threshold
})

// Event handlers
const CONTROL_INTEGRATION_GAIN = 0.03
const clamp = (value, min, max) => Math.max(min, Math.min(value, max))
const handleControlDelta = ({ vx, vy, dt }) => {
    // integrate velocity into position with local gain and clamp
    const nextX = controlPosition.value.x + vx * CONTROL_INTEGRATION_GAIN * dt
    const nextY = controlPosition.value.y + vy * CONTROL_INTEGRATION_GAIN * dt
    controlPosition.value = {
        x: clamp(nextX, -50, 50),
        y: clamp(nextY, -50, 50)
    }

    checkIfFinished()
}

// wait 10 seconds
setTimeout(() => {
    visibleMessages.value.push('syncwaves-hint-1');
}, 15000);

// Game logic
const checkIfFinished = async () => {
    if (isFinished.value || !isWithinGoalRange.value) return

    try {
        // Lock trackpad
        isFinished.value = true

        visibleMessages.value.push('syncwaves-complete');

        playSuccess();

        // Animate to goal
        await AnimationUtils.animateToGoal(
            controlPosition.value,
            goalPosition.value,
            speed.value,
            (position, newSpeed) => {
                controlPosition.value = position
                speed.value = newSpeed
            }
        )

        visibleMessages.value.push('syncwaves-complete');

        // Wait before completing the quest
        await TimingService.delay(QUEST_CONFIG.timing.goalAnimationDelay)

        // Wait and complete quest
        await TimingService.delay(QUEST_CONFIG.timing.completionDelay)

        // Emit completion event
        emit('questCompleted')
    } catch (error) {
        console.error('Error during quest completion:', error)
        // Fallback: still complete the quest
        emit('questCompleted')
    }
}

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

.control-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 2rem;
}

.trackpad-border {
    width: 100%;
    height: 100%;
}
</style>