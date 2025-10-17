<template>
  <main>
    <h1>About Count: {{ store.count }}</h1>
    <NuxtLink to="/">Home</NuxtLink>
  </main>
</template>

<script setup lang="ts">
import { useCounterStore } from '../stores/counter';
const store = useCounterStore();
</script>