<template>
    <div class="slider-control">
        <div class="slider-control-label">
            <span>
                {{ sliderLabel }}
            </span>

            <div class="row">
                <!-- html , vertical slider -->
                <div class="slider-container">
                    <input type=range style="writing-mode: vertical-lr; direction: rtl" min="0" max="10"
                        v-model="sliderValue" />
                </div>

                <div class="slider-dots">
                    <div class="slider-dot" v-for="i in 10" :key="i" :class="{ 'active': sliderValue >= i }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const sliderLabel = ref('Slider');
const sliderValue = ref(5);
</script>

<style scoped>
.slider-control {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.slider-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
}

input {
    height: 10rem;
    -webkit-appearance: none;
    background: #000000;
    border: 1px solid red;
    outline: none;
    opacity: 0.7;
    width: 20px;
    -webkit-transition: .2s;
    transition: all .2s;
    border-radius: 4px;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 30px;
        height: 30px;
        background: red;
        cursor: pointer;
        border-radius: 4px;
    }

    &::-moz-range-thumb {
        width: 30px;
        height: 30px;
        background: red;
        cursor: pointer;
        border-radius: 4px;
    }
}

.slider-dots {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: space-around;
}

.slider-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: transparent;
    border: 1px solid red;
    box-shadow: 0 0 6px 2px transparent;
    transition: all 0.5s ease-in-out;

    &.active {
        background-color: white;
        box-shadow: 0 0 6px 2px red;
    }
}
</style>