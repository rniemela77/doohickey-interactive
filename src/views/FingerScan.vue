<template>
    <div class="border h-100 d-flex align-items-center justify-content-center">
        <FingerprintControl @fingerprint="onFingerprintSuccess" />
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useQuestStore } from '../composables/useQuestStore'

const { visibleMessages } = useQuestStore()

onMounted(() => {
    visibleMessages.value.push('fingerprint');
})

import FingerprintControl from '../components/FingerprintControl.vue';

const emit = defineEmits(['fingerprintSuccess']);

const onFingerprintSuccess = () => {
    visibleMessages.value.push('fingerprint-success');
    emit('fingerprintSuccess');
}
</script>