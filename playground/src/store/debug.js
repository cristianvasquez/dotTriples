import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDebugStore = defineStore('debug-store', () => {
  const count = ref(0)
  const name = ref('Cristian')
  const doubleCount = computed(() => count.value * 2)

  function increment () {
    console.log('Incrementing')
    count.value++
  }

  return { count, name, doubleCount, increment }
})


