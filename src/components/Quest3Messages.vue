<template>
    <div v-if="steps.includes(3.0)">
        <p class="msg-them">
            A nearby worker has left his tablet on the snowbank. Notify me immediately when you've
            found it.
        </p>

        <button class="msg-you" :disabled="steps[steps.length - 1] !== 3.0" @click="steps.push(3.1)">
            Ok, I think I've found it. The screen's covered in snow.
        </button>
    </div>

    <div v-if="steps.includes(3.1)">
        <p class="msg-them">Understood- see if you can wipe it.</p>
    </div>

    <div v-if="steps.includes(3.2)">
        <button class="msg-you" :disabled="steps[steps.length - 1] !== 3.2" @click="steps.push(3.3)">
            Ok, I can see the screen now- it's a number pad.
        </button>
    </div>

    <div v-if="steps.includes(3.3)">
        <p class="msg-them">
            We found security footage of a worker writing the password down- I'm sending an image.
        </p>

        <button v-if="steps.includes(3.31)" class="msg-you" :disabled="steps[steps.length - 1] !== 3.31"
            @click="steps.push(3.32)">
            I tried 8016, but it didn't work.
        </button>
    </div>


    <div v-if="steps.includes(3.32)">
        <p class="msg-them">
            So it's not 8016? Strange. We know for a fact that the password is in that image.
            Maybe we're looking at it wrong?
        </p>

        <button v-if="steps.includes(3.33)" class="msg-you" :disabled="steps[steps.length - 1] !== 3.33"
            @click="steps.push(3.34)">
            I'm not sure what to do.
        </button>
    </div>

    <div v-if="steps.includes(3.34)">
        <p class="msg-them">
            Ah, I see it now. The image is upside-down! Type 9108, and hit enter.
        </p>
    </div>

    <div v-if="steps.includes(3.4)">
        <p class="msg-them">
            It looks like you entered the correct password, good job
        </p>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useQuestStore } from '../composables/useQuestStore'

const { steps } = useQuestStore()

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