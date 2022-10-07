<script setup>
import { darkTheme, NConfigProvider, NInput, NTree } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted, ref } from 'vue'
import ns from '../namespaces.js'
import { useWorkspaceState } from '../store/workspaceState.js'

onMounted(() => {
  init()
})

const store = useWorkspaceState()
const {
  currentWorkspacePath, currentContainers, currentSelection, currentFocus,
} = storeToRefs(store)

function init () {
  if (!currentWorkspacePath.value) {
    currentWorkspacePath.value = '../test/markdown'
  }
  if (!currentContainers.value.length) {
    store.doLoadWorkspace({ path: currentWorkspacePath.value })
  }
}

function updateSelectedKeys (v) {
  currentFocus.value = v[0]
}

function updateCheckedKeys (v) {
  currentSelection.value = [...v]
}

const pattern = ref()

const expanded = ref([])
onBeforeMount(() => {
  // This should come from the state somewhere
  expanded.value = [ns.dot.root.value]
})

</script>


<template>
  <n-config-provider :theme="darkTheme">
    <n-input v-model:value="pattern" placeholder="Search"/>
    <n-tree
        block-line
        cascade
        checkable
        selectable
        :default-expanded-keys="expanded"
        :expand-on-click="true"
        :pattern="pattern"
        :data="currentContainers"
        :checked-keys="currentSelection"
        @update:selected-keys="updateSelectedKeys"
        @update:checked-keys="updateCheckedKeys"
    />

  </n-config-provider>
</template>

<style>

.n-input {
  min-width: 100%
}

</style>
