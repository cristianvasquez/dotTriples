<script setup>

import { storeToRefs } from 'pinia'
import { useWorkspaceState } from '../store/workspaceState.js'

const workspaceState = useWorkspaceState()
const {
  currentWorkspacePath,
  currentContainers,
  currentSelection,
} = storeToRefs(workspaceState)


</script>

<template>

  <div>
    currentWorkspacePath: {{ currentWorkspacePath }}
    currentSelection: {{ currentSelection }}
  </div>

</template>
