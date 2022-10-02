<script setup>
import { baseLayout } from '../config.js'
import { useLayoutStore } from 'playground-template'

const store = useLayoutStore()
const { saveCurrentLayout, loadCurrentLayout, loadLayout } = store

const layouts = [
  { name: 'Default layout', data: baseLayout },
]

function load (index) {
  loadLayout(layouts[index].data)
}

</script>

<template>
  <div class="layouts">
    <button @click="loadCurrentLayout">Load current</button>
    <button @click="saveCurrentLayout">Save current</button>
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
