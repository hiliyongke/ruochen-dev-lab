<template>
  <div class="composition-life">
    <p>计数：{{ count }}</p>
    <button @click="count++">+1（触发更新）</button>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue'

const count = ref(0)

onBeforeMount(() => console.log('[Composition] onBeforeMount'))
onMounted(() => console.log('[Composition] onMounted'))
onBeforeUpdate(() => console.log('[Composition] onBeforeUpdate'))
onUpdated(() => console.log('[Composition] onUpdated'))
onBeforeUnmount(() => console.log('[Composition] onBeforeUnmount'))
onUnmounted(() => console.log('[Composition] onUnmounted'))
</script>

<style scoped>
.composition-life { display: flex; gap: 8px; align-items: center; }
button { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; }
</style>