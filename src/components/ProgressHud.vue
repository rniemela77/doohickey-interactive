<template>
    <div class="progress">
        <div class="progress-track">
            <div class="progress-fill" :style="{ width: clampedPercent + '%' }" />
        </div>
        <div v-if="showLabel" class="progress-label">{{ clampedPercent }}%</div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    percent: { type: Number, required: true },
    showLabel: { type: Boolean, default: true },
});

const clampedPercent = computed(() => {
    const p = Math.round(props.percent ?? 0);
    if (Number.isNaN(p)) return 0;
    return Math.min(100, Math.max(0, p));
});
</script>

<style scoped>
.progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.progress-track {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.15);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #9cff9c, #4caf50);
    width: 0%;
    transition: width 220ms ease;
}

.progress-label {
    font-size: 12px;
    opacity: 0.7;
}
</style>
