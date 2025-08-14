<template>
    <div class="timer-wrap" :class="{ inactive: !active }">
        <div class="timer">Time: {{ formattedTime }}</div>
        <div class="timebar">
            <div class="timebar-track">
                <div class="timebar-fill" :style="{ width: percent + '%' }" />
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    active: { type: Boolean, default: false },
    formattedTime: { type: String, required: true },
    percent: { type: Number, default: 0 },
});
</script>

<style scoped>
.timer-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
}

.timer {
    color: #ff5252;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.timebar {
    width: 100%;
}

.timebar-track {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: rgba(255, 82, 82, 0.2);
    overflow: hidden;
}

.timebar-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff8a80, #ff5252);
    width: 0%;
    transition: width 80ms linear;
}

.timer-wrap.inactive .timer {
    color: rgba(255, 255, 255, 0.5);
}

.timer-wrap.inactive .timebar-track {
    background: rgba(255, 255, 255, 0.15);
}

.timer-wrap.inactive .timebar-fill {
    background: rgba(255, 255, 255, 0.3);
}
</style>
