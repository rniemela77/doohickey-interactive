<template>
    <div class="message-container-wrapper">
        <div class="contact-name">{{ contact }}</div>

        <div class="message-container" ref="messageContainer">

            <slot />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const messageContainer = ref(null);
let observer = null;

const props = defineProps({
    contact: {
        type: String,
        required: true
    }
})

// any time a new element is added, scroll to the bottom
const scrollToBottom = () => {
    if (messageContainer.value) {
        messageContainer.value.scrollTo({
            top: messageContainer.value.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Auto-scroll when content changes
const setupAutoScroll = () => {
    if (!messageContainer.value) return;

    // Create a MutationObserver to watch for changes in the slot content
    observer = new MutationObserver((mutations) => {
        // Check if any mutations added new nodes
        const hasNewContent = mutations.some(mutation =>
            mutation.type === 'childList' && mutation.addedNodes.length > 0
        );

        if (hasNewContent) {
            // Use nextTick to ensure DOM is updated before scrolling
            nextTick(() => {
                scrollToBottom();
            });
        }
    });

    // Start observing the message container for changes
    observer.observe(messageContainer.value, {
        childList: true,
        subtree: true
    });
}

onMounted(() => {
    // Initial scroll to bottom
    nextTick(() => {
        scrollToBottom();
        setupAutoScroll();
    });
});

onUnmounted(() => {
    // Clean up the observer
    if (observer) {
        observer.disconnect();
    }
});

defineExpose({
    scrollToBottom
})
</script>

<style scoped>
.message-container-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0;
    max-width: 500px;
}

.contact-name {
    position: sticky;
    top: 0;
    width: 100%;
    background: rgba(255 255 255 / 0.27);
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
    padding: 1rem;
}

.message-container {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 80vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: red rgba(255, 0, 0, 0.2);
}

.message-container::-webkit-scrollbar {
    background: black;
}

.message-container::-webkit-scrollbar-thumb {
    /* background: red; */
    background: rgba(255, 0, 0, 0.2);
    border: 1px solid red;
}

.accordion-header {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.accordion-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
}

:deep(.conversation) > *{
    display: flex;
    flex-direction: column;
    gap: 10px;
}

:deep(.msg-you) {
    align-self: flex-end;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
    align-self: flex-end;

    &:disabled {
        border: none;
        cursor: default;
        color: rgba(0 187 255 / 1);
        background: none;
    }
}


:deep(.msg-them) {
    position: relative;
    display: inline-flex;
    align-items: flex-start;
    gap: 10px;

    &::before {
        content: '?';
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        flex: 0 0 20px;
        height: 20px;
        color: rgba(22 255 239 / 0.5);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
    }
}
</style>