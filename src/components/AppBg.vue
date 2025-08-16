<template>
    <div ref="layer" class="grain-noise" :style="{
        opacity: opacity.toString(),
        filter: `contrast(${contrast}%)`,
        backgroundImage: `url('${GRAIN_URL}')`,
        backgroundSize: `${tile}px ${tile}px`,
        inset: `-${bleed}px`
    }" aria-hidden="true" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

/** ⬇︎ PASTE your full data URI (starts with data:image/webp;base64,) */
const GRAIN_URL = 'data:image/webp;base64,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'

/** Tweakables (keep these tiny to stay subtle & cheap) */
const opacity = 0.15      // 0.03–0.14 typical
const tile = 100       // tile size of the noise image
const jitterPx = 100         // max random shift in px per axis (1–2 feels good)
const fps = 30        // how often to jump (frames per second)
const contrast = 10000       // makes speckles pop
const bleed = 800        // overscan; keep > (jitterPx * 8)

/** Impl */
const layer = ref(null)

let rafId, last = 0
const stepMs = 1000 / fps
const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)')
let pausedByPRM = mql?.matches ?? false

function randInt(n) {               // random integer in [-n, n]
    return (Math.random() * (2 * n + 1) | 0) - n
}

function tick(ts) {
    if (pausedByPRM || !layer.value) { rafId = requestAnimationFrame(tick); return }
    if (ts - last >= stepMs) {
        last = ts
        const x = randInt(jitterPx)
        const y = randInt(jitterPx)
        // compositor-only: transform translate3d
        layer.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    rafId = requestAnimationFrame(tick)
}

function handleVisibility() {
    if (document.hidden) {
        cancelAnimationFrame(rafId); rafId = null
    } else {
        last = 0; rafId = requestAnimationFrame(tick)
    }
}

onMounted(() => {
    // Start loop
    rafId = requestAnimationFrame(tick)
    // Pause when tab hidden to save CPU
    document.addEventListener('visibilitychange', handleVisibility)
    // Respect reduced motion
    if (mql) {
        mql.addEventListener('change', e => {
            pausedByPRM = e.matches
            if (pausedByPRM) {
                layer.value && (layer.value.style.transform = 'translate3d(0,0,0)')
            }
        })
    }
})

onBeforeUnmount(() => {
    cancelAnimationFrame(rafId)
    document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<style scoped>
.grain-noise {
    position: fixed;
    /* inset is set inline so we can use `bleed` */
    z-index: 0;
    /* above body bg, below content */
    pointer-events: none;
    background-repeat: repeat;
    will-change: transform;
    backface-visibility: hidden;
    /* avoids subpixel seams on some GPUs */
    /* No animation in CSS — JS jitters the transform at low Hz */
    mix-blend-mode: multiply;
}
</style>