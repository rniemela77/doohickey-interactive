<template>
    <div class="conversation">
        <div v-if="visibleSteps.includes(0)">
            <p class="msg-them">
                A nearby worker has left his tablet on the snowbank. Notify me immediately when you've
                found it.
            </p>

            <button class="msg-you" :disabled="visibleSteps[visibleSteps.length - 1] !== 0" @click="emit('next', 1)">
                Ok, I think I've found it. The screen's covered in snow.
            </button>
        </div>

        <div v-if="visibleSteps.includes(1)">
            <p class="msg-them">Understood- can you wipe it?</p>

            <button class="msg-you" :disabled="visibleSteps[visibleSteps.length - 1] !== 1"
                @click="emit('next', 2); emit('canWipe', true)">
                I'll try.
            </button>
        </div>

        <div v-if="visibleSteps.includes(2) && hasErasedHalf">
            <button class="msg-you" :disabled="visibleSteps[visibleSteps.length - 1] !== 2"
                @click="emit('next', 3); emit('canWipe', false)">
                Ok, I can see the screen now- it's a number pad.
            </button>
        </div>

        <div v-if="visibleSteps.includes(3)">
            <p class="msg-them">
                We found security footage of a worker writing the password down- I'm sending an image.
            </p>

            <p style="text-align: center;" v-if="!imageDownloaded">
                <button class="msg-you" @click="imageDownloaded = true">Download</button>
            </p>

            <PannableImage :src="stickiePassword" v-if="imageDownloaded" style="margin-top: 1rem;" />


            <button v-if="startShowingHints" class="msg-you" :disabled="visibleSteps[visibleSteps.length - 1] !== 3"
                @click="emit('next', 3.1)">
                The password doesn't work
            </button>
        </div>


        <div v-if="visibleSteps.includes(3.1)">
            <p class="msg-them">
                So it's not 8016? Strange. We know for a fact that the password is in that image.
                Maybe we're looking at it wrong?
            </p>

            <button class="msg-you" :disabled="visibleSteps[visibleSteps.length - 1] !== 3.1"
                @click="emit('next', 3.2)">
                I need help.
            </button>
        </div>

        <div v-if="visibleSteps.includes(3.2)">
            <p class="msg-them">
                Ah, I see it now. The image is upside-down! Type 9108, and hit enter.
            </p>
        </div>

        <div v-if="visibleSteps.includes(4)">
            <p class="msg-them">
                It looks like you entered the correct password, good job
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import PannableImage from './PannableImage.vue';
import stickiePassword from '../../stickie-password.png';

const props = defineProps({
    visibleSteps: {
        type: Array,
        required: true
    },
    hasErasedHalf: {
        type: Boolean,
        required: true
    },
    startShowingHints: {
        type: Boolean,
        required: true
    }
})

const emit = defineEmits(['next', 'canWipe'])

const imageDownloaded = ref(false)
</script>

<style scoped>
.frosty-screen-content-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    background: rgba(255, 255, 255, 0.1);

    border-radius: 1rem;
    overflow: hidden;

    & img {
        min-height: 300px;
        min-width: 300px;
        z-index: 1;
        /* transform now controlled inline via :style */
        filter: saturate(0.1) contrast(1.5) brightness(0.6);
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
}
</style>