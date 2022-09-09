import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout-store', () => {
  const count = ref(0)

  return {count}
})


