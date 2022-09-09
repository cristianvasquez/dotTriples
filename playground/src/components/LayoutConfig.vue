<script setup>
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '../store/layout.js'

const store = useLayoutStore()
const { count } = storeToRefs(store)

</script>

<template>
    <div >Name: {{ count }} Count </div>
</template>
