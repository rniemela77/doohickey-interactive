<template>
    <div class="quest1">
        <div class="quest1-title">
            <h1>Power up the signal</h1>
        </div>

        <div class="control-panel">
            <transition-group name="fade">
                <div class="border" v-if="showWaveChart">
                    <WaveChart :control-position="controlPosition" :goal-position="goalPosition" :speed="speed" />
                </div>

                <blockquote class="quest-text" v-if="showQuestText">
                    <div class="question-text-portrait"></div>
                    <p>
                        {{ questText }}
                    </p>
                </blockquote>

                <div class="border trackpad-border" v-if="showTrackPad">
                    <TrackPad @controlPositionChange="handleControlPositionChange" :disabled="isFinished" />
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WaveChart from './components/WaveChart.vue'
import TrackPad from './components/TrackPad.vue'

// Constants
const GOAL_POSITION = { x: -30, y: 30 }
const GOAL_THRESHOLD = 3
const CHECK_INTERVAL = 100
const ANIMATION_DURATION = 3000
const MAX_SPEED = 1.5
const INITIAL_SPEED = 0.3

// Reactive state
const controlPosition = ref({ x: 0, y: 0 })
const goalPosition = ref(GOAL_POSITION)
const speed = ref(INITIAL_SPEED)
const isFinished = ref(false)
const questText = ref('The signal is weak- but you can fix it.')
const emit = defineEmits(['questCompleted'])

// Computed properties
const isWithinGoalRange = computed(() => {
    const { x, y } = controlPosition.value
    const goal = goalPosition.value

    return Math.abs(x - goal.x) < GOAL_THRESHOLD &&
        Math.abs(y - goal.y) < GOAL_THRESHOLD
})

// Animation utilities
const easeInOutCubic = (t) => {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const animateToGoal = () => {
    const startTime = performance.now()
    const startX = controlPosition.value.x
    const startY = controlPosition.value.y
    const goalX = goalPosition.value.x
    const goalY = goalPosition.value.y
    const startSpeed = speed.value // Capture initial speed

    const animate = (now) => {
        const elapsedTime = now - startTime
        const progress = Math.min(1, elapsedTime / ANIMATION_DURATION)
        const easedProgress = easeInOutCubic(progress)

        // Gradually increase speed from start speed to max speed over animation duration
        speed.value = startSpeed + (MAX_SPEED - startSpeed) * easedProgress

        // Update position with easing
        controlPosition.value.x = startX + (goalX - startX) * easedProgress
        controlPosition.value.y = startY + (goalY - startY) * easedProgress

        if (progress < 1) {
            requestAnimationFrame(animate)
        } else {
            // Snap exactly to goal at the end
            controlPosition.value.x = goalX
            controlPosition.value.y = goalY
            speed.value = MAX_SPEED // Ensure final speed is exactly max
        }
    }

    requestAnimationFrame(animate)
}

// Event handlers
const handleControlPositionChange = (newPosition) => {
    controlPosition.value = newPosition
}

// Game logic
const checkIfFinished = async () => {
    if (isFinished.value || !isWithinGoalRange.value) return

    // lock trackpad
    isFinished.value = true

    // show wave chart goal animation
    animateToGoal()

    await new Promise(resolve => setTimeout(resolve, 5000))

    // show completed quest text
    showQuestText.value = true
    questText.value = 'Signal locked. You\'re smarter than I thought.'

    await new Promise(resolve => setTimeout(resolve, 6000))

    // showWaveChart.value = false
    showQuestText.value = false
    showTrackPad.value = false

    //emit to parent to go to next quest
    emit('questCompleted')
}

// Lifecycle
let checkInterval

const showWaveChart = ref(false)
const showQuestText = ref(false)
const showTrackPad = ref(false)

onMounted(async () => {
    // wait 1s, then show wave chart
    await new Promise(resolve => setTimeout(resolve, 1000))
    showWaveChart.value = true

    // wait 1s, then show quest text
    await new Promise(resolve => setTimeout(resolve, 1500))
    showQuestText.value = true

    // wait 1s, then show track pad
    await new Promise(resolve => setTimeout(resolve, 3000))
    showTrackPad.value = true

    // wait 1s, then hide quest text
    await new Promise(resolve => setTimeout(resolve, 1000))
    // wait 2s, then hide quest text
    showQuestText.value = false


    await new Promise(resolve => setTimeout(resolve, 1000))
    checkInterval = setInterval(checkIfFinished, CHECK_INTERVAL)
})

onUnmounted(() => {
    if (checkInterval) {
        clearInterval(checkInterval)
    }
})
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
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 2rem;
}

.border {
    border: 1px solid rgba(255, 0, 0, 0.6);
    border-radius: 4px;
    padding: 1rem;
}

.trackpad-border {
    width: 100%;
    height: 100%;
}

.quest-text {
    padding: 3rem 5rem;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    font-size: 2rem;
    font-weight: 600;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2;
    width: 80%;
    backdrop-filter: blur(4px);
    display: flex;
    gap: 2rem;
    align-items: center;
    justify-content: center;
    margin: 0;
    flex-wrap: wrap;
}

.question-text-portrait {
    flex: 0 0 150px;
    height: 150px;
    border-radius: 50%;
    border: 1px solid red;
    position: relative;

    &:after {
        content: "?";
        font-size: 2rem;
        font-weight: 600;
        color: #FF0000;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>