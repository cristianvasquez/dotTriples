<script setup>
import { NInput, NSpace } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useLayoutStore } from 'playground-template'
import { onBeforeMount, ref } from 'vue'
import { baseLayout, contentLayout } from '../layouts.js'
import { useWorkspaceState } from '../store/workspaceState.js'

const layoutStore = useLayoutStore()
const { saveCurrentLayout, loadCurrentLayout, loadLayout } = layoutStore

const layouts = [
  { name: 'Default layout', data: baseLayout },
  { name: 'Content', data: contentLayout },
]


const somePath = ref()

onBeforeMount(() => {
  if (!somePath.value) {
    somePath.value = '../test/markdown'
  }
})

function selectLayout (index) {
  layoutStore.loadLayout(layouts[index].data)
}

const workspaceStore = useWorkspaceState()

function selectWorkspace (workspacePath) {
  workspaceStore.doLoadWorkspace(somePath.value)
}

</script>

<template>
  <div class="layouts">
    <button @click="loadCurrentLayout">Load current</button>
    <button @click="saveCurrentLayout">Save current</button>
    <template v-for="(item, index) of layouts">
      <button @click="selectLayout(index)">{{ item.name }}</button>
    </template>

    <n-space horizontal>
      <n-input class="n-input" v-model:value="somePath" placeholder="Autosizable" autosize minlength="20"/>
      <button @click="selectWorkspace">Load workspace</button>
    </n-space>
  </div>
</template>

<style scoped>
.layouts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
