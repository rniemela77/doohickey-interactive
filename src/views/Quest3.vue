<template>
    <div class="quest3">
        <div class="row flex-wrap gap">
            <div class="border">
                <MessageContainer contact="(Unknown Number)">
                    <Quest3Messages 
                        :visibleSteps="visibleSteps" 
                        @next="visibleSteps.push($event)"
                        @canWipe="canWipe = $event" 
                        :hasErasedHalf="hasErasedHalf"
                        :startShowingHints="startShowingHints"
                    />
                </MessageContainer>
            </div>

            <div 
                :style="{ opacity: shouldShowFrostyScreen ? 1 : 0 }"
                class="frosty-screen-container"
            >
                <div class="border frosty-screen-placeholder"></div>

                <FrostyScreen 
                    :visibleSteps="visibleSteps" 
                    :canWipe="canWipe" 
                    @erasedHalf="hasErasedHalf = true"
                >
                    <div 
                        v-if="canWipe" 
                        class="control-tip-overlay"
                    >
                        Drag to Clean
                        <div class="drag-indicator"></div>
                    </div>

                    <BatteryConnectuiUI class="battery-ui" />

                    <div 
                        class="frosty-screen-content" 
                        :style="{ opacity: canWipe ? FROSTY_OPACITY_WHEN_WIPEABLE : 1 }"
                    >
                        <KeypadControls 
                            class="keypad-controls" 
                            @wrong-password="startShowingHints += 1"
                            :interactive="isKeypadInteractive" 
                            @correct-password="correctPassword" 
                        />
                    </div>
                </FrostyScreen>
            </div>
        </div>
    </div>
</template>

<script setup>
import KeypadControls from '../components/KeypadControls.vue';
import MessageContainer from '../components/MessageContainer.vue';
import Quest3Messages from '../components/Quest3Messages.vue';
import { ref, computed } from 'vue';
import BatteryConnectuiUI from '../components/BatteryConnectuiUI.vue'
import FrostyScreen from '../components/FrostyScreen.vue';

// Constants for better maintainability
const KEYPAD_INTERACTIVE_THRESHOLD = 3;
const FROSTY_OPACITY_WHEN_WIPEABLE = 0.6;

// Reactive state
const startShowingHints = ref(0);
const canWipe = ref(false);
const visibleSteps = ref([0]);
const hasErasedHalf = ref(false);

// Computed properties for cleaner template logic
const shouldShowFrostyScreen = computed(() => visibleSteps.value.includes(1));
const isKeypadInteractive = computed(() => visibleSteps.value.length >= KEYPAD_INTERACTIVE_THRESHOLD);

// Event handlers
const correctPassword = () => {
    visibleSteps.value.push(4);
};
</script>

<style scoped>
.quest3 {
    display: flex;
    flex-direction: column;
}

.frosty-screen-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.frosty-screen-placeholder {
    width: 100%;
    height: 100%;
    flex: 1;
}

.battery-ui {
    margin-bottom: 1rem;
    width: 100%;
}

.frosty-screen-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.keypad-controls {
    display: flex;
    align-items: stretch;
}

.control-tip-overlay {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: black;
    border: 1px solid black;
    font-size: 1.2rem;
    z-index: 10;
    gap: 2rem;
    animation: fadeOut 5s ease-in-out forwards;
}

.drag-indicator {
    top: 0;
    left: 0;
    width: 100px;
    height: 100px;
    background: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    animation: move 2s ease-in-out infinite;
}

.drag-indicator::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
    border-top: 40px solid transparent;
    border-bottom: 20px solid transparent;
    border-left: 40px solid black;
}

@keyframes fadeOut {
    0%, 80% {
        opacity: 1;
    }
    
    to {
        opacity: 0;
    }
}

@keyframes move {
    0%, 100% {
        transform: translateX(-30%) translateY(0%);
    }
    
    50% {
        transform: translateX(30%) translateY(-30%);
    }
}

/* Utility classes */
.message-container {
    max-width: 500px;
}

.flex-start {
    justify-content: flex-start;
}

.flex-wrap {
    flex-wrap: wrap;
}
</style>