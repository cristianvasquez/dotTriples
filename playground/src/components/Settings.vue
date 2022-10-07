<script setup>
import { NInput, NSpace } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useLayoutStore } from 'playground-template'
import { onBeforeMount, onMounted, ref } from 'vue'
import { baseLayout, contentLayout } from '../layouts.js'
import { useWorkspaceState } from '../store/workspaceState.js'

const store = useLayoutStore()

const {addCurrentLayout, selectLayout, deleteLayout} = store
const {userLayouts} = storeToRefs(store)

const layouts = [
  { name: 'Default layout', data: baseLayout },
  { name: 'Content', data: contentLayout },
]

const somePath = ref()


onMounted(()=>{
  store.init()
})


onBeforeMount(() => {
  if (!somePath.value) {
    somePath.value = '../test/markdown'
  }
})

const workspaceStore = useWorkspaceState()
function selectWorkspace () {
  workspaceStore.doLoadWorkspace({ path:somePath.value })
}

function load (index) {
  store.loadLayoutConfig(layouts[index].data)
}

</script>

<template>
  <div class="layouts">

    <template v-for="(item, index) of layouts">
      <button @click="load(index)">{{ item.name }}</button>
    </template>
    <button @click="addCurrentLayout">Save current</button>
    <template v-for="(item, index) of userLayouts">
      <div>
        <button @click="deleteLayout(index)">X</button>
        <button @click="selectLayout(index)">{{ item.date }}</button>
      </div>
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
