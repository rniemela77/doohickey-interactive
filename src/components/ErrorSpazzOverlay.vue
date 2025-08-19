<template>
    <div class="error-spazz-overlay">
        <div class="error-spazz-overlay-content">
            <div class="error-spazz-overlay-content-text">
                <span>ERROR</span>
                <div class="blocks"></div>
                <div class="blocks-2"></div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.error-spazz-overlay {
    position: relative;
    overflow: hidden;
    pointer-events: none;
}

.blocks {
    position: absolute;
    bottom: 20%;
    left: -10%;
    top: 5%;
    width: 70%;
    height: 10%;
    background: black;
    z-index: 1;
    animation: spazz-blocks 1s infinite alternate-reverse;
}

.blocks-2 {
    position: absolute;
    top: 90%;
    width: 20%;
    height: 40%;
    background: black;
    z-index: 1;
    animation: spazz-blocks-2 1.5s infinite alternate-reverse;
}

@keyframes spazz-blocks-2 {
    0%,
    10%,
    21% {
        top: 90%;
        right: 10%;
        width: 20%;
        height: 40%;
    }

    11%,
    20% {
        height: 30%;
        width: 10%;
        top: 50%;
        right: 10%;
        border: 1px solid black;
        background: transparent;
    }
}

@keyframes spazz-blocks {
    0%,
    10%,
    21% {
        height: 10%;
        width: 70%;
        left: -10%;
        background: black;
    }

    11%,
    20% {
        height: 40%;
        width: 10%;
        left: 30%;
        border: 1px solid black;
        background: transparent;
    }
}

span {
    font-size: 5rem;
    font-weight: 900;
    color: red;
    text-shadow: 0 0 10px red;
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 1000;
    animation: error-spazz 0.4s infinite;
}

@keyframes error-spazz {

    0%,
    49%,
    70% {
        transform: translateX(-10px);
    }

    50% {
        transform: translateX(150px);
        opacity: 0.4;
    }

    51% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>