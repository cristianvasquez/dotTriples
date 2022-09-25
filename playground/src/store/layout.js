import { defineStore } from 'pinia'
import { ref } from 'vue'
import { miniRowLayout } from '../config.js'

export const useLayoutStore = defineStore('layout-store', () => {

  const rootLayoutRef = ref(null)

  function loadLayout (config) {
    if (!rootLayoutRef.value) return
    rootLayoutRef.value.loadGLLayout(config)
  }

  function saveCurrentLayout () {
    if (!rootLayoutRef.value) return
    const currentLayout = rootLayoutRef.value.getLayoutConfig()
    localStorage.setItem('gl_config', JSON.stringify(currentLayout))
  }

  function loadCurrentLayout () {
    if (!rootLayoutRef.value) return
    const str = localStorage.getItem('gl_config')
    if (!str) {
      loadLayout(miniRowLayout)
    }
    const config = JSON.parse(str)
    loadLayout(config)
  }

  function addInstance (component) {
    if (!rootLayoutRef.value) return
    rootLayoutRef.value.addGLComponent(component)
  }

  return {
    rootLayoutRef,
    addInstance,
    saveCurrentLayout,
    loadCurrentLayout,
    loadLayout,
  }
})


