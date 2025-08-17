<template>
    <img src="../../cracked.png" alt="Broken Glass" class="broken-glass" />
</template>

<script setup>

</script>

<style scoped>
img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    mix-blend-mode: plus-lighter;
    opacity: 0.7;
    filter: contrast(0.8) invert(1);
    pointer-events: none;
}
</style>