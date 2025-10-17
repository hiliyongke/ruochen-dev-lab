<template>
  <div class="counter">
    <h3>{{ title }}</h3>
    <p>计数: {{ count }}</p>
    <button @click="count++">+1</button>
    <button @click="count--">-1</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '计数器' },
  initialCount: { type: Number, default: 0 }
})
const count = ref(props.initialCount)
</script>

<style scoped>
.counter { border: 1px solid #ddd; padding: 16px; border-radius: 8px; }
button { margin-right: 8px; }
</style>