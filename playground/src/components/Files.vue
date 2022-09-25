<script setup>
import { useWebSocket } from '@vueuse/core'
import { darkTheme, NButton, NConfigProvider, NInput, NSpace, NTree } from 'naive-ui'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { DIRECTORY } from '../actions.js'

const { status, data, send, open, close } = useWebSocket('ws://localhost:8080', {
  autoReconnect: true,
  // heartbeat: true,
})

onMounted(() => {
  open()
})
onUnmounted(() => {
  close()
})

function pushButton () {
  send(`${DIRECTORY}${vaultPath.value}`)
}

const vaultPath = ref('../test/markdown')

const files = ref([])
watch(data, () => {
  const message = JSON.parse(data.value)
  if (message.key === DIRECTORY) {
    files.value = message.data
    treeData.value = message.data.map((element, index) => ({
      label: element,
      key: index,
      isLeaf: true,
    }))
  }
})

const treeData = ref([
  {
    label: 'hola',
    key: '1',
    isLeaf: false,
  }])

function handleLoad (node) {
  return new Promise((resolve) => {
    node.children = [
      {
        label: 'hola',
        key: node.key + '1',
        isLeaf: true,
      },
      {
        label: 'mundo',
        key: node.key + '2',
        isLeaf: false,
      },
    ]
    resolve()
  })
}


</script>

<template>
  <n-config-provider :theme="darkTheme">

    <div>Status: {{ status }}</div>
    <div>Data: {{ files }}</div>
    <n-space horizontal>
      <n-input v-model:value="vaultPath" placeholder="Autosizable" autosize style="min-width: 100%"/>
      <n-button @click="pushButton">Load dir</n-button>
    </n-space>

    <n-tree

        :data="treeData"
        :on-load="handleLoad"

    />


  </n-config-provider>
</template>
