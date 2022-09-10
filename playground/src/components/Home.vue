<script setup>
import { onUnmounted } from 'vue'

onUnmounted(() => {
  console.log('onUnmounted')
})
</script>
<template>
  <div style="color: white">Home</div>
</template>

