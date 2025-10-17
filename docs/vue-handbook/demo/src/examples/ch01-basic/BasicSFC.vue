<template>
  <div class="box">
    <h3>{{ title }}</h3>
    <button @click="count++">count: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ title: { type: String, default: 'Hello Vue SFC' } })
const count = ref(0)
</script>

<style scoped>
.box { padding: 12px; border: 1px solid #eee; border-radius: 8px; }
</style>