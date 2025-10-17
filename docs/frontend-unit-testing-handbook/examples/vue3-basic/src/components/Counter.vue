<template>
  <div>
    <h1>Count: {{ count }}</h1>
    <button @click="inc">Increment</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
function inc() {
  count.value += 1;
}
</script>