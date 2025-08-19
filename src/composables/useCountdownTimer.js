import { ref, computed, onUnmounted } from 'vue';

export function useCountdownTimer(durationMs, tickMs = 10) {
	const active = ref(false);
	const timeLeftMs = ref(0);
	let intervalId = null;
	let onExpireCallback = null;

	const percent = computed(() => {
		return Math.round((Math.max(0, timeLeftMs.value) / durationMs) * 100);
	});

	function start() {
		reset();
		active.value = true;
		timeLeftMs.value = durationMs;
		intervalId = setInterval(() => {
			timeLeftMs.value = Math.max(0, timeLeftMs.value - tickMs);
			if (timeLeftMs.value <= 0) {
				const cb = onExpireCallback;
				reset();
				if (cb) cb();
			}
		}, tickMs);
	}

	function reset() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		active.value = false;
		timeLeftMs.value = 0;
	}

	function onExpire(cb) {
		onExpireCallback = cb;
	}

	onUnmounted(() => {
		reset();
	});

	return { active, timeLeftMs, percent, start, reset, onExpire };
}


