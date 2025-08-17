<template>
    <div>
        <div class="row justify-content-end">
            <button @click="toggleExpand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }">
                    <path d="M12 19L19 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>

        <div class="messages">
            <transition name="slideRight">
                <div v-if="isExpanded" class="messages-container">
                    <div class="message-container-wrapper">
                        <div class="contact-name">Unknown Number</div>

                        <div class="message-container" ref="messageContainer">
                            <Quest1Messages v-if="steps.includes(1.0)" />
                            <Quest2Messages v-if="steps.includes(2.0)" />
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useQuestStore } from '../composables/useQuestStore'
import Quest1Messages from './Quest1Messages.vue'
import Quest2Messages from './Quest2Messages.vue'
const { steps } = useQuestStore()

const props = defineProps({
    isExpanded: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['toggle-expand']);

function toggleExpand() {
    emit('toggle-expand', !props.isExpanded);
}

const messageContainer = ref(null);
let observer = null;

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
button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 1rem;
    border: 1px solid white;
    border-radius: 6px;
}

.messages {
    height: 100%;
    overflow: auto;
}

.messages-container {
    max-width: 100%;
    transition: all 0.3s ease-in-out;
}

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

:deep(.conversation)>* {
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