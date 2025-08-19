<template>
    <div class="slider-control" :class="{ horizontal, vertical: !horizontal }">
        <div class="slider-control-label" :style="{ flexDirection: horizontal ? 'column' : 'row' }">
            <span>
                {{ label }}
            </span>

            <div class="slider-wrapper" :class="{ horizontal, vertical: !horizontal }">
                <div class="slider-container">
                    <input type="range" :style="inputStyle" min="0" max="10" v-model="sliderValue" />
                </div>

                <div class="slider-dots" :class="{ horizontal, vertical: !horizontal }">
                    <div class="slider-dot" v-for="i in 10" :key="i" :class="{ 'active': sliderValue >= i }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { playSlider } from '../helpers/sounds';

const sliderValue = ref(0);

const props = defineProps({
    label: { type: String, default: 'Slider' },
    horizontal: { type: Boolean, default: false },
});

const inputStyle = computed(() => {
    if (props.horizontal) {
        return {
            width: '100%',
            height: '1rem'
        };
    } else {
        return {
            width: '1rem',
            height: '100%',
            writingMode: 'vertical-lr',
            direction: 'rtl'
        };
    }
});

const emit = defineEmits(['updateValue']);
watch(sliderValue, (value) => {
    playSlider();
    emit('updateValue', value);
});

</script>

<style scoped>
.slider-control {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
}

.slider-control.horizontal {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.slider-control.vertical {
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.slider-control-label {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    font-size: 1.2rem;
    color: white;
    width: 100%;
}

.slider-control.horizontal .slider-control-label {
    flex-direction: row;
    gap: 1rem;
}

.slider-wrapper {
    display: flex;
    gap: 1rem;
}

.slider-wrapper.horizontal {
    flex-direction: column;
    min-width: 200px;
}

.slider-wrapper.vertical {
    flex-direction: column;
    min-height: 200px;
}

.slider-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.slider-container input {
    -webkit-appearance: none;
    appearance: none;
    background: #000000;
    border: 1px solid red;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: all .2s;
    border-radius: 4px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;/* remove tap highlight  */

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 30px;
        height: 30px;
        background: red;
        cursor: pointer;
        border-radius: 4px;
        box-shadow: 0 0 6px 2px rgba(255, 0, 0, 0.3);
    }

    &::-moz-range-thumb {
        width: 30px;
        height: 30px;
        background: red;
        cursor: pointer;
        border-radius: 4px;
        border: none;
        box-shadow: 0 0 6px 2px rgba(255, 0, 0, 0.3);
    }

    &:hover {
        opacity: 1;
        border-color: #ff4444;

        &::-webkit-slider-thumb {
            background: #ff4444;
            box-shadow: 0 0 8px 3px rgba(255, 0, 0, 0.5);
        }

        &::-moz-range-thumb {
            background: #ff4444;
            box-shadow: 0 0 8px 3px rgba(255, 0, 0, 0.5);
        }
    }
}

.slider-dots {
    display: flex;
    justify-content: space-around;
}

.slider-dots.horizontal {
    flex-direction: row;
    min-width: 120px;
}

.slider-dots.vertical {
    flex-direction: column-reverse;
    min-height: 120px;
}

.slider-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: transparent;
    border: 1px solid red;
    box-shadow: 0 0 6px 2px transparent;
    transition: all 0.3s ease-in-out;

    &.active {
        background-color: white;
        box-shadow: 0 0 6px 2px red;
        border-color: white;
    }
}

.slider-dots.horizontal .slider-dot {
    margin: 0 2px;
}

.slider-dots.vertical .slider-dot {
    margin: 2px 0;
}
</style>