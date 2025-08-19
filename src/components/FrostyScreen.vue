<template>
    <div class="frosty-screen" ref="frostyEl">
        <canvas ref="frostyCanvas" class="frosty-overlay"
            :style="{ pointerEvents: canWipe ? 'auto' : 'none' }"></canvas>

        <slot></slot>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { playCorruption } from '../helpers/sounds';

const props = defineProps({
    canWipe: {
        type: Boolean,
        required: true
    }
})
const frostyEl = ref(null);
const frostyCanvas = ref(null);
const emit = defineEmits(['erasedHalf']);

let corruptionAudio = null;



let canvasCtx = null;
let isErasing = false;
let lastPoint = null;
let resizeObserver = null;
let lastStampPoint = null;
let nextStampStepPx = 0;
let nextStampRadiusPx = 0;
const brushRadiusBasePx = 70; // base brush radius in CSS pixels
const brushRadiusVarianceRatio = 0.2; // random +/- variance applied to base radius
const brushSoftEdgeRatio = 0.0000000000000000001; // larger value = harder edge
const brushSpacingBaseRatio = 0.4; // base spacing between stamps relative to radius
const brushSpacingVarianceRatio = 0.1; // random +/- variance added to base per stamp

// --- Color & texture tuning (easy to tweak) ---
// Slightly desaturated deep red base with room for variation
const ICE_BASE_RGB = { r: 140, g: 20, b: 30 };
// Ensure MIN <= MAX so clamps work as intended
const ICE_MIN_RGB = { r: 50, g: 10, b: 20 };
const ICE_MAX_RGB = { r: 220, g: 60, b: 70 };
const ICE_VARIATION_RANGE = 50; // +/- range added to base per pixel

// Dark highlights (used with 'multiply' for black dots)
const HIGHLIGHT_RGB = { r: 0, g: 0, b: 0 };

// Fog & speckle controls
const FOG_BLOB_COUNT = 14;            // Larger soft clouds
const FOG_BLOB_MAX_RADIUS_RATIO = 0.22; // Max radius relative to min(width, height)
const FOG_BLOB_MIN_RADIUS_RATIO = 0.08;
const FOG_BLOB_ALPHA = 0.05;          // Per-blob opacity (very subtle, layers add up)
const FOG_BLOB_BLUR_PX = 2;          // Soft blur for clouds

const POCK_MARK_COUNT = 120;          // Tiny pits in the frost
const POCK_MIN_RADIUS = 2;
const POCK_MAX_RADIUS = 15;
const POCK_RING_DARKEN_ALPHA = 0.15;  // Ring darkening around pits

const SPECKLE_COUNT = 200;           // Pepper noise for odd visuals
const SPECKLE_ALPHA = 0.6;

// Eraser gradient color (alpha is controlled where used)
const ERASER_RGB = { r: 0, g: 0, b: 0 };

// Counter to limit how often we check the erased area
let eraseCheckCounter = 0;
const ERASE_CHECK_INTERVAL = 10; // Check every 10 eraser operations

// track whether we've drawn the initial ice at least once
let hasInitialIce = false;


function setupCanvas() {
    const container = frostyEl.value;
    const canvas = frostyCanvas.value;
    if (!container || !canvas) return;

    // --- capture old pixels BEFORE resizing (resizing clears canvas) ---
    const hadPixels = canvas.width > 0 && canvas.height > 0 && hasInitialIce;
    let oldBitmap = null;
    let oldW = 0;
    let oldH = 0;

    if (hadPixels) {
        oldW = canvas.width;
        oldH = canvas.height;
        const off = document.createElement('canvas');
        off.width = oldW;
        off.height = oldH;
        const offCtx = off.getContext('2d');
        offCtx.drawImage(canvas, 0, 0);
        oldBitmap = off; // use offscreen canvas as source
    }

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set display size (css pixels)
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Set internal size (device pixels). NOTE: setting these clears the canvas.
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    canvasCtx = canvas.getContext('2d', { willReadFrequently: true });
    canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
    canvasCtx.scale(dpr, dpr);

    if (oldBitmap) {
        // restore previous pixels, scaling to the new CSS size
        canvasCtx.globalCompositeOperation = 'source-over';
        canvasCtx.drawImage(
            oldBitmap,
            0, 0, oldW, oldH,          // source (old device pixels)
            0, 0, rect.width, rect.height // destination (CSS pixels)
        );
    } else {
        // First time (or true reset): draw the ice
        canvasCtx.globalCompositeOperation = 'source-over';
        canvasCtx.clearRect(0, 0, rect.width, rect.height);
        drawVariedIce(rect.width, rect.height);
        hasInitialIce = true;
    }
}

function drawVariedIce(width, height) {
    // Improved noise function using multiple octaves for more natural patterns
    function improvedNoise(x, y) {
        let value = 0;
        let amplitude = 1.5;
        let frequency = 1.5;

        // Multiple octaves for more natural noise
        for (let i = 0; i < 4; i++) {
            const nx = x * frequency * 0.01;
            const ny = y * frequency * 0.01;

            // Use different noise patterns for each octave
            const noise1 = Math.sin(nx) * Math.cos(ny);
            const noise2 = Math.sin(nx * 2.3) * Math.cos(ny * 1.7);
            const noise3 = Math.sin(nx * 0.7) * Math.cos(ny * 2.1);

            value += (noise1 + noise2 + noise3) * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return (value + 1) / 2; // Normalize to 0-1
    }

    // Create multiple ice layers for depth
    function drawIceLayer(baseOpacity, colorVariation, scale) {
        for (let x = 0; x < width; x += 1) { // Smaller blocks for smoother gradients
            for (let y = 0; y < height; y += 1) {
                const noiseVal = improvedNoise(x * scale, y * scale);

                // Add subtle color variation for more realistic ice
                const variation = (Math.random() - 0.5) * ICE_VARIATION_RANGE;
                const r = Math.max(ICE_MIN_RGB.r, Math.min(ICE_MAX_RGB.r, ICE_BASE_RGB.r + variation));
                const g = Math.max(ICE_MIN_RGB.g, Math.min(ICE_MAX_RGB.g, ICE_BASE_RGB.g + variation));
                const b = Math.max(ICE_MIN_RGB.b, Math.min(ICE_MAX_RGB.b, ICE_BASE_RGB.b + variation));

                // Vary opacity based on noise and layer
                const layerOpacity = baseOpacity * (0.8 + noiseVal * 0.4);
                const finalOpacity = Math.max(0.1, Math.min(0.95, layerOpacity + colorVariation));

                canvasCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
                canvasCtx.fillRect(x, y, 1, 1);
            }
        }
    }

    // Draw multiple ice layers for depth
    // Base layer - thicker ice
    drawIceLayer(0.8, 0, 1.0);

    // Middle layer - medium ice with some variation
    drawIceLayer(0.6, 0.1, 1.5);

    // Top layer - thin frost with more variation
    drawIceLayer(0.4, 0.2, 3.0);

    // Add some crystalline highlights (now dark/black dots)
    canvasCtx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 70; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2.5 + 0.8;
        const opacity = Math.random() * 0.25 + 0.08;

        canvasCtx.fillStyle = `rgba(${HIGHLIGHT_RGB.r}, ${HIGHLIGHT_RGB.g}, ${HIGHLIGHT_RGB.b}, ${opacity})`;
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, size, 0, Math.PI * 2);
        canvasCtx.fill();
    }

    // Subtle foggy cloud blobs
    (function drawFogBlobs() {
        const minSide = Math.max(1, Math.min(width, height));
        const rMin = minSide * FOG_BLOB_MIN_RADIUS_RATIO;
        const rMax = Math.max(rMin + 1, minSide * FOG_BLOB_MAX_RADIUS_RATIO);
        canvasCtx.save();
        try {
            canvasCtx.filter = `blur(${FOG_BLOB_BLUR_PX}px)`;
        } catch (_) { /* filter may not be supported */ }
        canvasCtx.globalCompositeOperation = 'screen';
        for (let i = 0; i < FOG_BLOB_COUNT; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = rMin + Math.random() * (rMax - rMin);
            const grad = canvasCtx.createRadialGradient(x, y, 0, x, y, r);
            const alpha = FOG_BLOB_ALPHA * (0.6 + Math.random() * 0.8);
            grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
            grad.addColorStop(1, `rgba(255,255,255,0)`);
            canvasCtx.fillStyle = grad;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, r, 0, Math.PI * 2);
            canvasCtx.fill();
        }
        canvasCtx.restore();
    })();

    // Tiny pock marks / spock-marks
    (function drawPockMarks() {
        for (let i = 0; i < POCK_MARK_COUNT; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = POCK_MIN_RADIUS + Math.random() * (POCK_MAX_RADIUS - POCK_MIN_RADIUS);

            // Darken ring using multiply for a crater rim
            canvasCtx.save();
            canvasCtx.globalCompositeOperation = 'multiply';
            canvasCtx.strokeStyle = `rgba(60, 10, 10, ${POCK_RING_DARKEN_ALPHA})`;
            canvasCtx.lineWidth = 1 + Math.random() * 1.2;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, r, 0, Math.PI * 2);
            canvasCtx.stroke();
            canvasCtx.restore();

            // Occasional inner dark core for depth
            if (Math.random() < 0.45) {
                canvasCtx.save();
                canvasCtx.globalCompositeOperation = 'multiply';
                const innerR = Math.max(0.5, r * (0.3 + Math.random() * 0.4));
                const grad = canvasCtx.createRadialGradient(x, y, 0, x, y, innerR);
                grad.addColorStop(0, `rgba(20,5,5,0.14)`);
                grad.addColorStop(1, `rgba(20,5,5,0)`);
                canvasCtx.fillStyle = grad;
                canvasCtx.beginPath();
                canvasCtx.arc(x, y, innerR, 0, Math.PI * 2);
                canvasCtx.fill();
                canvasCtx.restore();
            }
        }
    })();

    // Speckle noise for odd visuals
    (function drawSpeckle() {
        canvasCtx.save();
        const prevGCO = canvasCtx.globalCompositeOperation;
        try {
            canvasCtx.globalCompositeOperation = 'overlay';
        } catch (_) {
            // Fallback for browsers that don't support 'overlay'
            canvasCtx.globalCompositeOperation = 'multiply';
        }
        for (let i = 0; i < SPECKLE_COUNT; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const alpha = SPECKLE_ALPHA * (0.6 + Math.random() * 0.8);
            canvasCtx.fillStyle = `rgba(40,10,10,${alpha})`;
            const size = Math.random() < 0.85 ? 1 : 2; // mostly single-pixel specks
            canvasCtx.fillRect(x, y, size, size);
        }
        canvasCtx.restore();
    })();

    // Reset composite operation
    canvasCtx.globalCompositeOperation = 'source-over';
}

function pointerPosition(event) {
    const rect = frostyCanvas.value.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function eraseDot(x, y, radiusPx) {
    if (!canvasCtx) return;
    canvasCtx.save();
    canvasCtx.globalCompositeOperation = 'destination-out';
    const innerR = Math.max(0, radiusPx * brushSoftEdgeRatio);
    const grad = canvasCtx.createRadialGradient(x, y, 0, x, y, radiusPx);
    grad.addColorStop(0, `rgba(${ERASER_RGB.r},${ERASER_RGB.g},${ERASER_RGB.b},1)`);
    grad.addColorStop(Math.min(1, innerR / radiusPx), `rgba(${ERASER_RGB.r},${ERASER_RGB.g},${ERASER_RGB.b},1)`);
    grad.addColorStop(1, `rgba(${ERASER_RGB.r},${ERASER_RGB.g},${ERASER_RGB.b},0)`);
    canvasCtx.fillStyle = grad;
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, radiusPx, 0, Math.PI * 2);
    canvasCtx.fill();
    canvasCtx.restore();
}

function computeNextStepPx(radiusPx) {
    const offset = (Math.random() * 2 - 1) * brushSpacingVarianceRatio; // [-variance, +variance]
    const ratio = Math.max(0, brushSpacingBaseRatio + offset);
    return Math.max(1, radiusPx * ratio);
}

function computeNextRadiusPx() {
    const offset = (Math.random() * 2 - 1) * brushRadiusVarianceRatio; // [-variance, +variance]
    const radius = Math.max(1, brushRadiusBasePx * (1 + offset));
    return radius;
}

function stampToward(toPoint) {
    if (!lastStampPoint) return;
    let dx = toPoint.x - lastStampPoint.x;
    let dy = toPoint.y - lastStampPoint.y;
    let remaining = Math.hypot(dx, dy);
    if (remaining === 0) return;
    let ux = dx / remaining;
    let uy = dy / remaining;
    while (remaining >= nextStampStepPx) {
        const nx = lastStampPoint.x + ux * nextStampStepPx;
        const ny = lastStampPoint.y + uy * nextStampStepPx;
        eraseDot(nx, ny, nextStampRadiusPx);
        lastStampPoint = { x: nx, y: ny };
        remaining -= nextStampStepPx;
        nextStampRadiusPx = computeNextRadiusPx();
        nextStampStepPx = computeNextStepPx(nextStampRadiusPx);
        // Recompute direction after moving forward
        dx = toPoint.x - lastStampPoint.x;
        dy = toPoint.y - lastStampPoint.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) break;
        ux = dx / dist;
        uy = dy / dist;
    }
    // Check if half the screen has been erased after each stamp
    checkErasedArea();
}

function onPointerDown(event) {
    if (!frostyCanvas.value) return;
    frostyCanvas.value.setPointerCapture(event.pointerId);
    isErasing = true;
    const { x, y } = pointerPosition(event);
    lastPoint = { x, y };
    lastStampPoint = { x, y };
    nextStampRadiusPx = computeNextRadiusPx();
    nextStampStepPx = computeNextStepPx(nextStampRadiusPx);
    eraseDot(x, y, nextStampRadiusPx);

    // Check if half the screen has been erased after the first dot
    checkErasedArea();
}

function onPointerMove(event) {
    if (!isErasing || !lastPoint) return;
    const { x, y } = pointerPosition(event);
    stampToward({ x, y });
    lastPoint = { x, y };
}

function endErasing(event) {
    if (!frostyCanvas.value) return;
    try { frostyCanvas.value.releasePointerCapture(event.pointerId); } catch (_) { }
    isErasing = false;
    lastPoint = null;
    lastStampPoint = null;
    nextStampStepPx = 0;
    nextStampRadiusPx = 0;

    // Check if half the screen has been erased
    checkErasedArea();
}

function checkErasedArea() {
    // Only check every few eraser operations for performance
    eraseCheckCounter++;
    if (eraseCheckCounter % ERASE_CHECK_INTERVAL !== 0) return;

    if (!canvasCtx || !frostyCanvas.value) return;

    const canvas = frostyCanvas.value;
    const rect = canvas.getBoundingClientRect();
    const totalPixels = rect.width * rect.height;

    // Get image data to analyze transparency
    const imageData = canvasCtx.getImageData(0, 0, rect.width, rect.height);
    const data = imageData.data;

    let transparentPixels = 0;
    let totalPixelsChecked = 0;

    // Sample pixels to check transparency (check every 4th pixel for performance)
    for (let i = 0; i < data.length; i += 16) {
        const alpha = data[i + 3]; // Alpha channel
        if (alpha < 128) { // Consider pixel transparent if alpha < 128
            transparentPixels++;
        }
        totalPixelsChecked++;
    }

    // Calculate percentage of transparent pixels
    const transparentPercentage = (transparentPixels / totalPixelsChecked) * 100;

    // Set hasErasedHalf to true if more than 40% of the screen is transparent
    // (allowing for some variance since we're sampling pixels)
    if (transparentPercentage > 80) {
        corruptionAudio.fadeOut();
        emit('erasedHalf', true);
    }
}

onMounted(() => {
    setupCanvas();
    const canvas = frostyCanvas.value;
    if (canvas) {
        canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
        canvas.addEventListener('pointermove', onPointerMove, { passive: true });
        canvas.addEventListener('pointerup', endErasing, { passive: true });
        canvas.addEventListener('pointerleave', endErasing, { passive: true });
    }

    resizeObserver = new ResizeObserver(() => setupCanvas());
    if (frostyEl.value) resizeObserver.observe(frostyEl.value);
    window.addEventListener('orientationchange', setupCanvas);
    window.addEventListener('resize', setupCanvas);

    // hack
    setTimeout(() => {
        corruptionAudio = playCorruption();
    }, 1000);
});

onBeforeUnmount(() => {
    if (corruptionAudio) {
        corruptionAudio.stop();
    }
    const canvas = frostyCanvas.value;
    if (canvas) {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', endErasing);
        canvas.removeEventListener('pointerleave', endErasing);
    }
    if (resizeObserver && frostyEl.value) resizeObserver.unobserve(frostyEl.value);
    window.removeEventListener('orientationchange', setupCanvas);
    window.removeEventListener('resize', setupCanvas);
});
</script>

<style scoped>
.frosty-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    touch-action: none;
    border: none;
}

.frosty-screen {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 1rem;
    position: relative;
    overflow: hidden;
}
</style>