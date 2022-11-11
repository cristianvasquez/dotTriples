<script setup>
/* eslint-disable */
import '@rdfjs-elements/rdf-editor'

import { defineProps, ref, onMounted } from 'vue'
import ns from '../../namespaces.js'

const props = defineProps({
  format: {
    required: true,
    default: 'text/turtle', // application/trig
    type: String
  },
  quads: Array,
})

const parseError = ref()

function onParsingFailed (e) {
  parseError.value = e?.detail?.error
}

const editor = ref()

function onQuadsChanged ({ detail }) {
  console.log('parsed', detail.value.length, 'quads')
  parseError.value = ''
}

function getPrefixes () {
  const result = {}
  for (const [key, value] of Object.entries(ns)) {
    result[key.toString()] = value().value.toString()
  }
  return result
}

const prefixes = ref(getPrefixes())

</script>

<template>

  <div class="edit-box-container">

    <div v-if="parseError">
      {{ parseError }}
    </div>

    <rdf-editor ref="editor"
                :customPrefixes="prefixes"
                :format="format"
                :quads="quads"
                auto-parse
                parseDelay="1000"
                @quads-changed="onQuadsChanged"
                @parsing-failed="onParsingFailed"
    />

  </div>

</template>
<style scoped>

.edit-box-container {
  display: flex;
  gap: 10px;
  flex-direction: column;
  min-width: 400px;
}
</style>
