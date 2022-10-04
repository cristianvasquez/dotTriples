<script setup>

import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useWorkspaceState } from '../store/workspaceState.js'
import {  NInput } from 'naive-ui'

const store = useWorkspaceState()
const {
  currentSelection,
  currentData,
} = storeToRefs(store)

watch(currentSelection, () => store.doTriplify(currentSelection.value))


</script>

<template>

  <div>
    <n-input
        v-model:value="currentData"
        type="textarea"
        :autosize="{
        minRows: 3
      }"
    />
  </div>

</template>
