import { reactive, ref, computed } from "vue";

const questText = [
  {
    // start
    id: "pre-activation",
    text: "You're not supposed to be here. Activate- or face the consequences.",
  },
  {
    // loading bar starts
    id: "pre-loading",
    text: "You're in. Await further instructions.",
  },
  {
    // fingerprint scanner shows
    id: "fingerprint",
    text: "Scan now. It's watching."
  },
  {
    // fingerprint scanner completes / sync waves start
    id: "fingerprint-success",
    text: "Identity confirmed. Sync the core now."
  },
  {
    // after 10 seconds without syncing
    id: "syncwaves-hint-1",
    text: "Match the red and blue waves with the white. Keep it steady."
  },
  {
    // syncwaves complete
    id: "syncwaves-complete",
    text: "Core stable. Proceed."
  },
  {
    // matching dots start
    id: "pre-matching-dots",
    text: "Light up the panel."
  },
  {
    // matching dots start
    id: "matching-dots-start",
    text: "Align the grid. Match them fast."
  },
  {
    // matching dots after 15sec
    id: "matching-dots-hint-1",
    text: "Drag to test. Green means right."
  },
  {
    // matching dots complete
    id: "matching-dots-complete",
    text: "Grid aligned. Brace yourself. It's waking up."
  },
  {
    // loud crackle, sludge comes down
    id: "sludge-start",
    text: "Corruption detected- quickly, wipe it out!"
  },
  {
    id: "sludge-end",
    text: "The corruption has been held back temporarily. Crack the code." 
  },
  {
    id: "keypad-entry-hint-1",
    text: "The password is in the image- perhaps we need to look closer."
  },
  {
    id: "keypad-entry-complete",
    text: "You've done well."
  }
]

const visibleMessages = ref([]);

const currentMessage = computed(() => {
  return questText.find(message => message.id === visibleMessages.value[visibleMessages.value.length - 1]) || { text: '' };
});

export function useQuestStore() {
  return {
    visibleMessages,
    currentMessage,
    questText,
  };
}
