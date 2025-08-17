<template>
    <div class="go-root" :style="vars" aria-hidden="true">
        <div class="go-scanlines"></div>
        <div class="go-vignette"></div>
    </div>
</template>

<script setup>
const props = {
    opacity: 1,
    scanlineOpacity: 0.2,
    scanlineStep: 4,
    speed: 20,
    vignetteStrength: 0.99, // 0 to 1
    zIndex: 2147483647
}

const vars = {
    '--go-opacity': String(props.opacity),
    '--go-scanline-opacity': String(props.scanlineOpacity),
    '--go-step': `${props.scanlineStep}px`,
    '--go-speed': `${props.speed}s`,
    '--go-vignette': String(props.vignetteStrength),
    '--go-z': String(props.zIndex)
}
</script>

<style scoped>
.go-root {
    position: fixed;
    /* toggled to fixed by class below */
    inset: 0;
    pointer-events: none;
    z-index: var(--go-z);
    opacity: var(--go-opacity);

    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
}

/* positioning modes */
.go-fixed {
    position: fixed;
}

.go-absolute {
    position: absolute;
}

/* moving scanlines */
.go-scanlines {
    position: absolute;
    inset: 0;
    background:
        repeating-linear-gradient(to bottom,
            rgba(0, 0, 0, var(--go-scanline-opacity)) 0 1px,
            transparent 1px var(--go-step));
    mix-blend-mode: multiply;
    animation: go-scan-move var(--go-speed) linear infinite;
}

/* soft vignette */
.go-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(100% 100% at 50% 50%,
            transparent 40%,
            rgba(0, 0, 0, var(--go-vignette)) 100%);
}

/* animation */
@keyframes go-scan-move {
    from {
        background-position: 0 0;
    }

    to {
        background-position: 0 200px;
    }
}
</style>