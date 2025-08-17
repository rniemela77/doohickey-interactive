<template>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg-filters">
        <defs>
            <filter id="filter">
                <feTurbulence type="fractalNoise" :baseFrequency="`${freqX} ${freqY}`" :numOctaves="1" result="warp"></feTurbulence>
                <feDisplacementMap xChannelSelector="R" yChannelSelector="G" :scale="scale" in="SourceGraphic" in2="warp" />
            </filter>
        </defs>
    </svg>

    <div class="controls" v-show="showControls">
        <label>
            baseFrequencyX
            <input id="freqX" type="range" min="0.0001" max="0.2" step="0.001" :value="freqX" />
            <input id="freqXNum" type="number" min="0.0001" max="0.2" step="0.001" :value="freqX" />
        </label>

        <label>
            baseFrequencyY
            <input id="freqY" type="range" min="0.0001" max="0.2" step="0.001" :value="freqY" />
            <input id="freqYNum" type="number" min="0.0001" max="0.2" step="0.001" :value="freqY" />
        </label>

        <label>
            scale
            <input id="scale" type="range" min="0" max="100" step="1" :value="scale" />
            <input id="scaleNum" type="number" min="0" max="100" step="1" :value="scale" />
        </label>
    </div>

    <div class="affected">
        <slot></slot>
    </div>

</template>

<script setup>
import { onMounted } from 'vue';

const props = defineProps({
    freqX: {
        type: Number,
        required: true
    },
    freqY: {
        type: Number,
        required: true
    },
    scale: {
        type: Number,
        required: true
    },
    showControls: {
        type: Boolean,
        default: false
    }
})

onMounted(() => {
    const turb = document.querySelector('#filter feTurbulence');
    const dm = document.querySelector('#filter feDisplacementMap');

    const freqX = document.getElementById('freqX');
    const freqY = document.getElementById('freqY');
    const scale = document.getElementById('scale');

    const freqXNum = document.getElementById('freqXNum');
    const freqYNum = document.getElementById('freqYNum');
    const scaleNum = document.getElementById('scaleNum');

    function clamp(val, min, max) {
        const n = Number(val);
        if (Number.isNaN(n)) return min;
        return Math.min(max, Math.max(min, n));
    }

    function update() {
        const x = Number(freqX.value);
        const y = Number(freqY.value);
        const s = Number(scale.value);

        turb.setAttribute('baseFrequency', `${x} ${y}`);
        dm.setAttribute('scale', String(s));

        // keep range & number inputs in sync
        freqXNum.value = String(x);
        freqYNum.value = String(y);
        scaleNum.value = String(s);
    }

    // range -> update
    freqX.addEventListener('input', update);
    freqY.addEventListener('input', update);
    scale.addEventListener('input', update);

    // number -> sync to range then update (with clamping)
    freqXNum.addEventListener('input', () => {
        const v = clamp(freqXNum.value, 0.0001, 0.2);
        freqX.value = String(v);
        update();
    });
    freqYNum.addEventListener('input', () => {
        const v = clamp(freqYNum.value, 0.0001, 0.2);
        freqY.value = String(v);
        update();
    });
    scaleNum.addEventListener('input', () => {
        const v = clamp(scaleNum.value, 0, 100);
        scale.value = String(v);
        update();
    });

    // initial paint
    update();
});
</script>

<style scoped>
.svg-filters {
    position: absolute;
    visibility: hidden;
    width: 1px;
    height: 1px;
}

.controls {
    display: grid;
    gap: 0.75rem;
    margin-bottom: 1rem;
    max-width: 420px;
    position: fixed;
    top:0;
    left:0;
}

label {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.affected {
    -webkit-filter: url("#filter");
    filter: url("#filter");
    width: 200px;
    height: 100px;
    border: 2px solid black;
    box-shadow: 0 0 0 10px transparent;
}
</style>