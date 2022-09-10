<script setup>
import { miniRowLayout } from '../config.js'
import { useLayoutStore } from '../store/layout.js'

const store = useLayoutStore()
const { addInstance, saveCurrentLayout, loadCurrentLayout, loadLayout } = store

const layouts = [
  { name: 'Default layout', data: miniRowLayout },
]

function load (index) {
  loadLayout(layouts[index].data)
}

</script>

<template>

  <div class="layouts">

    <button @click="loadCurrentLayout">Load Layout</button>
    <button @click="saveCurrentLayout">Save Layout</button>
    <template v-for="(item, index) of layouts">
      <button @click="load(index)">{{ item.name }}</button>
    </template>
  </div>
</template>
<style scoped>
.layouts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}



</style>
