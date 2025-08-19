<template>
    <div class="messages" :class="{ 'modal-open border': isExpanded }">
        <div class="message-expand-button d-flex align-items-center gap">
            <p class="flex-1 m-0" v-if="!isExpanded">
                <transition name="slideRight">
                    <span :key="currentMessage.id">
                        {{ currentMessage.text }}
                    </span>
                </transition>
            </p>


            <div v-if="isExpanded">
                <div class="message-container" ref="messageContainer">
                    <p v-for="message in visibleMessages" :key="message"
                        :class="{ 'text-red': currentMessage.id === message }">
                        - {{questText?.find(text => text.id === message).text}}
                    </p>
                </div>
            </div>

            <button @click="toggleExpand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    :style="{ transform: isExpanded ? 'rotate(270deg)' : 'rotate(90deg)' }">
                    <path d="M12 19L19 12L12 5" stroke="red" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M5 12H19" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useQuestStore } from '../composables/useQuestStore'

const { visibleMessages, currentMessage, questText } = useQuestStore()

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

.modal-open {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(15px);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    justify-content: space-between;

    .message-expand-button {
        justify-content: space-between;
        align-items: flex-start;
        height: 100%;
        width: 100%;
    }
}
</style>