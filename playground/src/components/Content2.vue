<script setup>
import { storeToRefs } from 'pinia'
import { useDebugStore } from '../store/debug.js'

const store = useDebugStore()
const { name, doubleCount } = storeToRefs(store)
const { increment } = store

</script>

<template>
  <button @click="increment"> Increment</button>
  <div >Name: {{ name }} Count {{ doubleCount }}</div>
</template>
