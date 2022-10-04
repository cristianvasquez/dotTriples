<script setup>
import '@rdfjs-elements/rdf-editor'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useWorkspaceState } from '../store/workspaceState.js'
import Markdown from 'vue3-markdown-it';

const store = useWorkspaceState()
const {
  currentSelection,
  currentContents,
} = storeToRefs(store)

watch(currentSelection, () => store.doRetrieveContents(currentSelection.value))

// https://github.com/JanGuillermo/vue3-markdown-it
</script>

<template>

  <div>
    <template v-for="markdown of currentContents">
      <div>
        <Markdown :source="markdown" />
      </div>
    </template>
  </div>

</template>
