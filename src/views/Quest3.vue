<template>
    <div class="quest3">
        <div class="row flex-wrap gap">
            <div class="border">
                <MessageContainer contact="(Unknown Number)">
                    <Quest3Messages :visibleSteps="visibleSteps" @next="visibleSteps.push($event)"
                        @canWipe="canWipe = $event" :hasErasedHalf="hasErasedHalf"
                        :startShowingHints="startShowingHints" />
                </MessageContainer>
            </div>


            <div :style="{ opacity: visibleSteps.includes(1) ? 1 : 0 }"
                style="display: flex; flex-direction: column; gap: 1rem;">
                <div class="border" style="width: 100%; height: 100%; flex: 1;"></div>

                <FrostyScreen :visibleSteps="visibleSteps" :canWipe="canWipe" @erasedHalf="hasErasedHalf = true">
                    <div class="control-tip-overlay" v-if="canWipe">
                        Drag to Clean
                        <div class="drag-indicator">
                        </div>
                    </div>

                    <BatteryConnectuiUI style="margin-bottom: 1rem; width: 100%;" />

                    <div class="frosty-screen-content" :style="{ opacity: canWipe ? 0.6 : 1 }">
                        <KeypadControls class="keypad-controls" @wrong-password="startShowingHints = true"
                            :interactive="visibleSteps.length >= 3" @correct-password="correctPassword" />
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
import { ref } from 'vue';
import BatteryConnectuiUI from '../components/BatteryConnectuiUI.vue'
import FrostyScreen from '../components/FrostyScreen.vue';

const startShowingHints = ref(false);
const canWipe = ref(false);
const visibleSteps = ref([0]);
const hasErasedHalf = ref(false);

const correctPassword = () => {
    visibleSteps.value.push(4);
}
</script>

<style scoped>
.quest3 {
    display: flex;
    flex-direction: column;
}

.message-container {
    max-width: 500px;
}

.flex-start {
    justify-content: flex-start;
}

.flex-wrap {
    flex-wrap: wrap;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    left: 0;
    width: 100%;
    height: 100%;
    color: black;
    border: 1px solid black;
    font-size: 1.2rem;
    z-index: 10;
    gap: 2rem;
    animation: fadeOut 5s ease-in-out forwards;


    .drag-indicator {
        top: 0;
        left: 0;
        width: 100px;
        height: 100px;
        background: rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        animation: move 2s ease-in-out infinite;


        &::after {
            content: '';
            position: absolute;
            top: 50%;
            width: 0;
            height: 0;
            border-top: 40px solid transparent;
            border-bottom: 20px solid transparent;
            border-left: 40px solid black;
        }
    }
}

@keyframes fadeOut {

    0%,
    80% {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

@keyframes move {

    0%,
    100% {
        transform: translateX(-30%) translateY(0%)
    }

    50% {
        transform: translateX(30%) translateY(-30%)
    }
}
</style>