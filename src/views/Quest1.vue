<template>
    <div class="quest1">
        <div class="quest1-title">
            <h1>Synchronize Signal Frequency</h1>
        </div>

        <div class="control-panel">
            <transition-group name="fade">
                <div class="border" v-if="state.showWaveChart">
                    <WaveChart 
                        :control-position="controlPosition" 
                        :goal-position="goalPosition" 
                        :speed="speed" 
                    />
                </div>

                <blockquote class="quest-text" v-if="state.showQuestText">
                    <div class="question-text-portrait"></div>
                    <p>{{ questText }}</p>
                </blockquote>

                <div class="border trackpad-border" v-if="state.showTrackPad">
                    <TrackPad 
                        @controlPositionChange="handleControlPositionChange" 
                        :disabled="isFinished" 
                    />
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WaveChart from '../components/WaveChart.vue'
import TrackPad from '../components/TrackPad.vue'

// Configuration object for easy maintenance
const QUEST_CONFIG = {
    goal: { x: -30, y: 30 },
    threshold: 3,
    checkInterval: 100,
    animation: {
        duration: 3000,
        maxSpeed: 1.5,
        initialSpeed: 0.3
    },
    timing: {
        waveChartDelay: 1000,
        questTextDelay: 1500,
        trackPadDelay: 3000,
        questTextHideDelay: 1000,
        finalDelay: 1000,
        goalAnimationDelay: 2000,
        completionDelay: 3000
    },
    messages: {
        initial: 'The signal is weak- but you can fix it.',
        completed: 'Signal locked. You\'re smarter than I thought.'
    }
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
const questText = ref(QUEST_CONFIG.messages.initial)

// Component state management
const state = ref({
    showWaveChart: false,
    showQuestText: false,
    showTrackPad: false
})

const emit = defineEmits(['questCompleted'])

// Computed properties
const isWithinGoalRange = computed(() => {
    const { x, y } = controlPosition.value
    const goal = goalPosition.value
    const threshold = QUEST_CONFIG.threshold

    return Math.abs(x - goal.x) < threshold && Math.abs(y - goal.y) < threshold
})

// Event handlers
const handleControlPositionChange = (newPosition) => {
    controlPosition.value = newPosition
}

// Game logic
const checkIfFinished = async () => {
    if (isFinished.value || !isWithinGoalRange.value) return

    try {
        // Lock trackpad
        isFinished.value = true

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

        // Wait and show completion message
        await TimingService.delay(QUEST_CONFIG.timing.goalAnimationDelay)
        
        state.value.showQuestText = true
        questText.value = QUEST_CONFIG.messages.completed

        // Wait and complete quest
        await TimingService.delay(QUEST_CONFIG.timing.completionDelay)
        
        // Hide components
        state.value.showQuestText = false
        state.value.showTrackPad = false
        state.value.showWaveChart = false

        // Emit completion event
        emit('questCompleted')
    } catch (error) {
        console.error('Error during quest completion:', error)
        // Fallback: still complete the quest
        emit('questCompleted')
    }
}

// Lifecycle management
let checkInterval

const initializeQuest = async () => {
    try {
        await TimingService.sequence([
            async () => {
                await TimingService.delay(QUEST_CONFIG.timing.waveChartDelay)
                state.value.showWaveChart = true
            },
            async () => {
                await TimingService.delay(QUEST_CONFIG.timing.questTextDelay)
                state.value.showQuestText = true
            },
            async () => {
                await TimingService.delay(QUEST_CONFIG.timing.trackPadDelay)
                state.value.showTrackPad = true
            },
            async () => {
                await TimingService.delay(QUEST_CONFIG.timing.questTextHideDelay)
                state.value.showQuestText = false
            },
            async () => {
                await TimingService.delay(QUEST_CONFIG.timing.finalDelay)
                checkInterval = setInterval(checkIfFinished, QUEST_CONFIG.checkInterval)
            }
        ])
    } catch (error) {
        console.error('Error initializing quest:', error)
    }
}

onMounted(initializeQuest)

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