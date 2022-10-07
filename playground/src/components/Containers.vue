<script setup>
import { darkTheme, NConfigProvider, NTree } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useWorkspaceState } from '../store/workspaceState.js'

onMounted(() => {
  init()
})

const store = useWorkspaceState()
const {
  currentWorkspacePath, currentContainers, currentSelection,
} = storeToRefs(store)

function init () {
  if (!currentWorkspacePath.value) {
    currentWorkspacePath.value = '../test/markdown'
  }
  if (!currentContainers.value.length) {
    store.doLoadWorkspace({ path: currentWorkspacePath.value })
  }
}

function updateCheckedKeys (v) {
  currentSelection.value = [...v]
}

// function handleOpenContainer (node) {
//   return new Promise((resolve) => {
//     node.children = [
//       {
//         label: 'hola',
//         key: node.key + '1',
//         isLeaf: true,
//       },
//       {
//         label: 'mundo',
//         key: node.key + '2',
//         isLeaf: false,
//       },
//     ]
//     resolve()
//   })
// }

</script>

<template>
  <n-config-provider :theme="darkTheme">
    <!--        :on-load="handleOpenContainer"-->
    <n-tree

        block-line
        cascade
        checkable
        :data="currentContainers"
        :checked-keys="currentSelection"
        @update:checked-keys="updateCheckedKeys"
    />

  </n-config-provider>
</template>

<style>

.n-input {
  min-width: 100%
}

</style>
