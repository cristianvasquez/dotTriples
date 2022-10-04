<script setup>
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useWorkspaceState } from '../store/workspaceState.js'
import EditBox from './common/Editbox.vue'
import '@rdfjs-elements/rdf-editor'

const store = useWorkspaceState()
const {
  currentSelection,
  currentQuads,
} = storeToRefs(store)

watch(currentSelection, () => store.doTriplify(currentSelection.value))


</script>

<template>

  <div>

    <template v-if="currentQuads.length>0">
      <edit-box format="application/trig" :quads="currentQuads"/>
    </template>

  </div>

</template>
