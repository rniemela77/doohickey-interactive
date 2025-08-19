<template>
    <div class="border">
        <h1>That's all for now!</h1>

        <p>Thanks for playing!</p>

        <hr />

        <i class="text-red">Created by: Robert Niemela</i>
        <p>Visit my website: <a href="https://rvniemela.com" target="_blank">rvniemela.com</a></p>

        <div style="margin-top: 40px;">
            <button class="reset-button" @click="reset">Play again</button>
        </div>
    </div>
    </template>

<script setup>
const reset = () => {
    window.location.reload()
}
</script>

<style scoped>
a {
    color: white;
    padding: 1rem;
    font-size: 1.2rem;
}
.reset-button {
    background:transparent;
    color:white;
    cursor:pointer;
    padding: 1rem 2rem;
    border: 1px solid white;

    &:hover {
        background: white;
        color: black;
    }
}
</style>