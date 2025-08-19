<template>
    <div class="keypad-controls-container" @focusin="handleFocusIn" @focusout="handleFocusOut"
        :class="{ 'interactive': interactive }">
        <div class="keypad-label-container" :class="{ 'success': status === 'correct' }">
            <div class="keypad-label">
                <span v-if="status === 'loading'">VERIFYING <span class="loading-dots">...</span></span>
                <span v-else-if="status === 'correct'" class="underline">ACCESS GRANTED</span>
                <span v-else-if="status === 'incorrect'" class="underline">ACCESS DENIED</span>
                <span v-else>{{ keypadValue }}<span v-if="isFocused" class="keypad-label-caret">_</span></span>
            </div>
        </div>

        <div class="keypad-controls" :class="{ 'loading': status !== 'ready' }">
            <button class="key" v-for="i in 9" :key="i" @click="handleKeyClick(i)">
                {{ i }}
            </button>
            <button class="key" @click="handleKeyClick('delete')">
                delete
            </button>
            <button class="key" @click="handleKeyClick('0')">
                0
            </button>
            <button class="key" @click="handleEnterClick">
                enter
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { playKeypad } from '../helpers/sounds'

const props = defineProps({
    interactive: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['wrong-password', 'correct-password'])

const keypadValue = ref('')
const correctPassword = ref('9108')

const handleKeyClick = (i) => {
    playKeypad()
    if (i === 'delete') {
        keypadValue.value = keypadValue.value.slice(0, -1)
    } else if (keypadValue.value.length < 9) {
        keypadValue.value += `${i}`
    }
}

const status = ref('ready')

const handleEnterClick = async () => {
    status.value = 'loading'

    await new Promise(resolve => setTimeout(resolve, 2000))

    if (keypadValue.value === correctPassword.value) {
        status.value = 'correct'
        emit('correct-password')
    } else {
        emit('wrong-password')
        status.value = 'incorrect'
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
    keypadValue.value = '';
    status.value = 'ready';
}

const isFocused = ref(false)
const handleFocusIn = () => {
    isFocused.value = true
}

const handleFocusOut = () => {
    isFocused.value = false
}
</script>

<style scoped>
.keypad-controls-container {
    width: max-content;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    pointer-events: none;
}

.interactive {
    pointer-events: auto;
}

.keypad-controls {
    display: grid;
    grid-template-columns: repeat(3, 80px);
    grid-template-rows: repeat(4, 80px);
    gap: 0.3rem;

    &.loading {
        pointer-events: none;

        .key {
            color: rgba(255, 255, 255, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
    }
}

.key {
    border: 1px solid red;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    font-weight: bold;
    color: red;
    background-color: transparent;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    text-align: center;
    transition: all 0.1s ease-in-out;

    &:hover {
        background: rgba(255, 0, 0, 0.1);
    }

    &:active {
        opacity: 0.5;
    }
}

.keypad-label {
    width: fit-content;
    font-size: 1.4rem;
    font-weight: bold;
    padding: 0.5rem;
    text-align: center;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'SevenSegment', sans-serif;

}

.keypad-label-container {
    border: 1px solid red;
    color: red;

    &.success {
        color: lime;
        border: 1px solid lime;
    }
}

.keypad-label-caret {
    display: inline-block;
    animation: blink 1s infinite;
    font-size: 1.5rem;
    transform: translateY(-2px);
    padding-left: 0.2rem;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

@keyframes blink {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.loading-dots {
    animation: blink 1s infinite;
}

@keyframes loading-dots {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}
</style>