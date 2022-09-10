
<script setup>
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import Glayout from './components/layout/Glayout.vue'
import { CONFIG, COUNTER, HOME } from './config.js'
import { useLayoutStore } from './store/layout.js'

const store = useLayoutStore()
const { rootLayoutRef } = storeToRefs(store)
const { addInstance, saveCurrentLayout, loadCurrentLayout } = store


const components = [HOME,CONFIG,COUNTER]

onMounted(()=>{
  loadCurrentLayout()
})

</script>

<template>
  <div class="full-height">
    <div id="nav">
      <h1>Playground</h1>
      <template v-for="component of components">
        <button @click="addInstance(component)">
          {{ component.title }}
        </button>
      </template>

    </div>
    <glayout
        ref="rootLayoutRef"
        glc-path="../"
        style="width: 100%; height: calc(100% - 90px)"
    ></glayout>
  </div>
</template>

<style>
@import "golden-layout/dist/css/goldenlayout-base.css";
@import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";

html {
  height: 100%;
}

body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.full-height, #app {
  height: 100%;
}
</style>


