<template>
  <div class="quest1">
    <div class="quest1-title">
      <h1>Power up the signal</h1>
    </div>

    <div class="control-panel">
      <div class="border">
        <WaveChart 
          :control-position="controlPosition" 
          :goal-position="goalPosition" 
          :speed="speed" 
        />
      </div>

      <div class="border">
        <TrackPad 
          @controlPositionChange="handleControlPositionChange" 
          :disabled="isFinished" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WaveChart from './components/WaveChart.vue'
import TrackPad from './components/TrackPad.vue'

// Constants
const GOAL_POSITION = { x: -30, y: 30 }
const GOAL_THRESHOLD = 5
const CHECK_INTERVAL = 100
const ANIMATION_DURATION = 3000
const MAX_SPEED = 1.5
const INITIAL_SPEED = 0.3

// Reactive state
const controlPosition = ref({ x: 0, y: 0 })
const goalPosition = ref(GOAL_POSITION)
const speed = ref(INITIAL_SPEED)
const isFinished = ref(false)

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
const checkIfFinished = () => {
  if (isFinished.value || !isWithinGoalRange.value) return

  isFinished.value = true
  console.log('Quest completed!')
  animateToGoal()
}

// Lifecycle
let checkInterval

onMounted(() => {
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
  align-items: stretch;
  width: 100%;
  height: 100%;
  gap: 2rem;
}

.border {
  border: 1px solid red;
  border-radius: 4px;
  padding: 1rem;
}
</style>