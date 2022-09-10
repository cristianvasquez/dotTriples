<script setup>
import { ref } from 'vue'

const GLComponent = ref(null)

const numberToPixels = (value) => {
  return value.toString(10) + 'px'
}

const setPosAndSize = (
    left,
    top,
    width,
    height,
) => {
  if (GLComponent.value) {
    // HTMLElement
    const el = GLComponent.value
    el.style.left = numberToPixels(left)
    el.style.top = numberToPixels(top)
    el.style.width = numberToPixels(width)
    el.style.height = numberToPixels(height)
  }
}

const setVisibility = (visible) => {
  if (GLComponent.value) {
    // HTMLElement
    const el = GLComponent.value
    if (visible) {
      el.style.display = ''
    } else {
      el.style.display = 'none'
    }
  }
}

const setZIndex = (value) => {
  if (GLComponent.value) {
    const el = GLComponent.value
    el.style.zIndex = value
  }
}

defineExpose({
  setPosAndSize,
  setVisibility,
  setZIndex,
})
</script>

<template>
  <div ref="GLComponent" style="position: absolute; overflow: hidden">
    <slot></slot>
  </div>
</template>
