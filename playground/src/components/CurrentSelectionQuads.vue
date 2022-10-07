<script setup>
import '@rdfjs-elements/rdf-editor'
import { storeToRefs } from 'pinia'
import { useWorkspaceState } from '../store/workspaceState.js'
import EditBox from './common/Editbox.vue'

const store = useWorkspaceState()
const {
  currentSelectionQuads,
} = storeToRefs(store)

</script>

<template>

  <div>
    <template v-if="currentSelectionQuads.length>0">
      <edit-box format="application/trig" :quads="currentSelectionQuads"/>
    </template>
  </div>

</template>
