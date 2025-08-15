<template>
    <div class="timer-wrap" :class="{ inactive: !active }">
        <div class="timer-label-container">
            <div class="timer-label">TIME</div>
            <div class="timer-label-sub">ACTIVE TIME REMAINING</div>
        </div>

        <div class="timer">
            <span class="timer-seconds-wrapper">
                <span class="timer-seconds" v-if="active">{{ formattedTimeSeconds }}</span>
                <span class="timer-seconds-bg">00</span>
            </span>
            <span class="timer-milliseconds-wrapper">
                <span class="timer-milliseconds" v-if="active">:{{ formattedTimeMilliseconds }}</span>
                <span class="timer-milliseconds-bg">:00</span>
            </span>
        </div>

        <p class="hud-details">
            <span>RMG</span>
            <span>D16</span>
            <span>VOG</span>
        </p>
        <div class="timebar">
            <div class="timebar-track">
                <div class="timebar-fill" :style="{ width: percent + '%' }" />
            </div>
        </div>

        <div class="cone"></div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    active: { type: Boolean, default: false },
    time: { type: Number, required: true },
    percent: { type: Number, default: 0 },
});

const formattedTimeSeconds = computed(() => {
    const seconds = Math.floor(props.time / 1000);
    return seconds < 10 ? `0${seconds}` : seconds;
});

const formattedTimeMilliseconds = computed(() => {
    const milliseconds = props.time % 1000;
    return milliseconds < 10 ? `0${milliseconds}` : milliseconds.toFixed(0).slice(0, 2);
});
</script>

<style scoped>
.timer-label,
.timer,
.timer-label-sub {
    background: black;
    padding: 0.5rem;
}

.timer-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    position: relative;
    padding: 0.5rem 0 1rem 2rem;
    overflow: hidden;
}

.timer-label-container {
    display: flex;
    align-items: flex-end;

    * {
        width: fit-content;
    }
}

.timer-label-sub {
    width: max-content;
    font-size: 0.5rem;
    padding-left: 0;
}


.timer {
    color: #ff5252;
    font-family: 'SevenSegment', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    height: 5rem;
    display: flex;
    align-items: flex-end;
    width: 100%;
    padding-left: 1.5rem;

    .timer-seconds-wrapper,
    .timer-milliseconds-wrapper {
        position: relative;
        height: 100%;
        width: 100%;
        display: flex;
        align-items: flex-end;
    }

    .timer-seconds-bg,
    .timer-milliseconds-bg {
        color: rgba(255, 255, 255, 0.15);
        z-index: 0;
    }

    .timer-seconds,
    .timer-milliseconds {
        color: red;
    }

    .timer-seconds-bg,
    .timer-milliseconds-bg,
    .timer-seconds,
    .timer-milliseconds {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        flex: 1;
    }

    .timer-seconds-wrapper {
        font-size: 4.5rem;
        width: 4.5rem;
    }

    .timer-milliseconds-wrapper {
        font-size: 2rem;
        width: 2rem;
        bottom: 0.5rem;
    }
}

.hud-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.3rem;
    margin: 0.1rem;
    margin-right: 1rem;

    &>span {
        font-size: 0.5rem;
        background: black;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 2.2rem;
        height: 2.2rem;
    }
}

.timebar {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    z-index: -1;
}

.timebar-track {
    width: 100%;
    height: 100%;
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


.cone {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 1rem;
    width: 5rem;
    background: black;
    transform-origin: bottom left;
    rotate: -55deg;

    &:after {
        content: '';
        position: absolute;
        bottom: -0.5rem;
        right: 0;
        width: 100%;
        height: 100%;
        rotate: 10deg;
        background: black;
    }
}
</style>
