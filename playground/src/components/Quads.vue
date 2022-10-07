<script setup>
import '@rdfjs-elements/rdf-editor'
import { NButton, NPopselect } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useWorkspaceState } from '../store/workspaceState.js'
import EditBox from './common/Editbox.vue'
import {ref} from 'vue'

const store = useWorkspaceState()
const {
  currentQuads,
} = storeToRefs(store)

const value = ref([])
const options = ref([
  {
    label: 'Go Let It Out',
    value: 'Go Let It Out',
  },
  {
    label: 'Who Feels Love?',
    value: 'Who Feels Love?',
  },
  {
    label: 'Sunday Morning Call',
    value: 'Sunday Morning Call',
    disabled: true,
  },
  {
    label: 'Roll It Over',
    value: 'Roll It Over',
  },
])


</script>

<template>

  <div>
<!--    <n-popselect v-model:value="value" multiple :options="options">-->
<!--      <n-button>-->
<!--        {{ Array.isArray(value) && value.length ? value : 'Nothing' }}-->
<!--      </n-button>-->
<!--    </n-popselect>-->
    <template v-if="currentQuads.length>0">
      <edit-box format="application/trig" :quads="currentQuads"/>
    </template>

  </div>

</template>
