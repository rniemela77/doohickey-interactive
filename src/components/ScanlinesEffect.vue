<template>
    <div class="crt" :class="{ 'is-debug': debug }" :style="styleVars">
        <div class="crt__content">
            <slot />
        </div>
        <div v-if="roll" class="scan-roll" aria-hidden="true"></div>
    </div>
</template>

<script>
export default {
    name: "Scanlines",
    props: {
        // Stronger, more visible defaults
        scanlineColor: { type: String, default: "rgba(0, 0, 0, 0.7)" },
        scanlineSpacing: { type: [Number, String], default: 4 }, // px or CSS unit
        scanlineThickness: { type: [Number, String], default: 2 },
        scanlineBlend: { type: String, default: "normal" }, // 'normal' is most visible/perf-friendly

        flickerStrength: { type: Number, default: 0.08 },
        flickerSpeed: { type: [Number, String], default: 700 }, // ms or CSS time
        roll: { type: Boolean, default: true },

        vignetteStrength: { type: Number, default: 0.35 },

        // Helpful while testing visibility
        debug: { type: Boolean, default: false },
    },
    computed: {
        styleVars() {
            const spacing = typeof this.scanlineSpacing === 'number' ? `${this.scanlineSpacing}px` : String(this.scanlineSpacing);
            const thick = typeof this.scanlineThickness === 'number' ? `${this.scanlineThickness}px` : String(this.scanlineThickness);
            const flicker = typeof this.flickerSpeed === 'number' ? `${this.flickerSpeed}ms` : String(this.flickerSpeed);
            return {
                '--scanline-color': this.scanlineColor,
                '--scanline-spacing': spacing,
                '--scanline-thickness': thick,
                '--scanline-blend': this.scanlineBlend,
                '--flicker-strength': this.flickerStrength,
                '--flicker-speed': flicker,
                '--vignette-strength': this.vignetteStrength,
            };
        },
    },
};
</script>

<style scoped>
/* Container does not enforce size; it wraps slot content */
.crt {
    position: relative;
    isolation: isolate;
    overflow: hidden;
}

.crt__content {
    position: relative;
    z-index: 3;
}

/* Highly visible scanlines */
.crt::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(to bottom,
            transparent 0,
            transparent calc(var(--scanline-spacing) - var(--scanline-thickness)),
            var(--scanline-color) calc(var(--scanline-spacing) - var(--scanline-thickness)),
            var(--scanline-color) var(--scanline-spacing));
    mix-blend-mode: var(--scanline-blend);
    animation: flicker var(--flicker-speed) steps(2, end) infinite;
    z-index: 4;
}

/* Optional vignette for punch on edges (still visible with blend: normal) */
.crt::after {
    content: "";
    position: absolute;
    inset: -1px;
    pointer-events: none;
    background: radial-gradient(110% 100% at 50% 50%, transparent 60%, rgba(0, 0, 0, var(--vignette-strength)) 100%);
    mix-blend-mode: multiply;
    z-index: 4;
}

/* Rolling scan bar */
.scan-roll {
    position: absolute;
    inset: -30% -10%;
    pointer-events: none;
    background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, .16) 50%, transparent 100%);
    animation: roll 6s linear infinite;
    filter: blur(1px);
    z-index: 2;
}

@keyframes flicker {
    50% {
        opacity: calc(1 - var(--flicker-strength));
    }
}

@keyframes roll {
    from {
        transform: translateY(-50%);
    }

    to {
        transform: translateY(50%);
    }
}

/* Debugging aid: give background so lines show no matter what */
.is-debug {
    background: linear-gradient(135deg, #1f2937 0%, #0b1220 100%);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {

    .crt::before,
    .scan-roll {
        animation: none !important;
    }
}
</style>