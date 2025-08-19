<template>
    <div class="messages" :class="{ 'modal-open': isExpanded }">
        <div class="message-expand-button d-flex align-items-center">
            <p class="flex-1 m-0">
                Messages
            </p>

            <button @click="toggleExpand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    :style="{ transform: isExpanded ? 'rotate(270deg)' : 'rotate(90deg)' }">
                    <path d="M12 19L19 12L12 5" stroke="red" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M5 12H19" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>

        <div v-if="isExpanded" class="modal">
            <div class="contact-name">Unknown Number</div>

            <div class="message-container" ref="messageContainer">
                <Quest0Messages v-if="steps.includes(0.0)" />
                <Quest1Messages v-if="steps.includes(1.0)" />
                <Quest2Messages v-if="steps.includes(2.0)" />
                <Quest3Messages v-if="steps.includes(3.0)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useQuestStore } from '../composables/useQuestStore'
import Quest0Messages from './Quest0Messages.vue'
import Quest1Messages from './Quest1Messages.vue'
import Quest2Messages from './Quest2Messages.vue'
import Quest3Messages from './Quest3Messages.vue'

const { steps } = useQuestStore()

const props = defineProps({
    isExpanded: {
        type: Boolean,
        default: false
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
.message-expand-button {
    button {
        background: transparent;
        border: 1px solid red;
        cursor: pointer;
        height: 64px;
        width: 64px;
        transition: filter 0.15s ease-in-out;

        &:hover {
            filter: brightness(5);
        }
    }
}

 
</style>