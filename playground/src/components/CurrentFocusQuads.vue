<script setup>
import '@rdfjs-elements/rdf-editor'
import { storeToRefs } from 'pinia'
import { useWorkspaceState } from '../store/workspaceState.js'
import EditBox from './common/Editbox.vue'

const store = useWorkspaceState()
const {
  currentFocusQuads,
} = storeToRefs(store)

</script>

<template>

  <div>
    <template v-if="currentFocusQuads.length>0">
      <edit-box format="application/trig" :quads="currentFocusQuads"/>
    </template>
  </div>

</template>
