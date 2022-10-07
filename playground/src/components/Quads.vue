<script setup>
import '@rdfjs-elements/rdf-editor'
import { storeToRefs } from 'pinia'
import { useWorkspaceState } from '../store/workspaceState.js'
import EditBox from './common/Editbox.vue'

const store = useWorkspaceState()
const {
  currentQuads,
} = storeToRefs(store)

</script>

<template>

  <div>

    <template v-if="currentQuads.length>0">
      <edit-box format="application/trig" :quads="currentQuads"/>
    </template>

  </div>

</template>
