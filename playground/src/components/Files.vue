<script setup>
import { darkTheme, NButton, NConfigProvider, NInput, NSpace, NTree } from 'naive-ui'

import { io } from 'socket.io-client'
import { onMounted, onUnmounted, ref } from 'vue'
import { DIRECTORY } from '../actions.js'

const socket = io('ws://localhost:3000')

onMounted(() => {
  socket.open()
})
onUnmounted(() => {
  socket.close()
})

const vaultPath = ref('../test/markdown')

function pushButton () {
  socket.emit(DIRECTORY, vaultPath.value)
}

const files = ref([])

const treeData = ref([
  {
    label: 'hola',
    key: '1',
    isLeaf: false,
  }])

socket.on(DIRECTORY, (arg) => {
  const directory = JSON.parse(arg)
  files.value = directory
  treeData.value = directory.map((element, index) => ({
    label: element,
    key: index,
    isLeaf: true,
  }))
})

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

    <div>Files: {{ files }}</div>
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
