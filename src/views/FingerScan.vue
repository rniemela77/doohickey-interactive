<template>
    <div class="border h-100 d-flex align-items-center justify-content-center">
        <FingerprintControl @fingerprint="onFingerprintSuccess" />
    </div>
</template>

<script setup>
import FingerprintControl from '../components/FingerprintControl.vue';

const emit = defineEmits(['fingerprintSuccess']);

const onFingerprintSuccess = () => {
    emit('fingerprintSuccess');
}
</script>