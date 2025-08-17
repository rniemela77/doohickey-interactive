import { reactive, ref } from "vue";

const steps = ref([])

export function useQuestStore() {
  return {
    steps,
  };
}
