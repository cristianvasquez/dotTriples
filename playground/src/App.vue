
<script setup>
import { onMounted, ref } from 'vue'
import Glayout from './components/layout/Glayout.vue'
import { miniRowLayout } from './layout/predefined-layouts'

const rootLayoutRef = ref(null)

const onClickInitLayoutMinRow = () => {
  if (!rootLayoutRef.value) return
  rootLayoutRef.value.loadGLLayout(miniRowLayout)
}

const components = [
  {
    componentType: 'LayoutConfig',
    title: 'Layout config',
  },
  {
    componentType: 'Content2',
    title: 'Content 2',
  },
  {
    componentType: 'Content3',
    title: 'Content 3',
  },
]

function addComponent(component){
  if (!rootLayoutRef.value) return
  rootLayoutRef.value.addGLComponent(component)
}

const onClickSaveLayout = () => {
  if (!rootLayoutRef.value) return
  const config = rootLayoutRef.value.getLayoutConfig()
  localStorage.setItem('gl_config', JSON.stringify(config))

}

const onClickLoadLayout = () => {
  const str = localStorage.getItem('gl_config')
  if (!str) return
  if (!rootLayoutRef.value) return
  const config = JSON.parse(str)
  rootLayoutRef.value.loadGLLayout(config)
}

onMounted(()=>{
  onClickLoadLayout()
})

</script>

<template>
  <div class="full-height">
    <div id="nav">
      <h1 >Playground</h1>
      <button @click="onClickInitLayoutMinRow">Reset layout</button>
      <template v-for="component of components">
        <button @click="addComponent(component)">
          {{ component.title }}
        </button>
      </template>
      <button @click="onClickSaveLayout">Save Layout</button>
      <button @click="onClickLoadLayout">Load Layout</button>
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


