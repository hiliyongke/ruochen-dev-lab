<template>
  <main>
    <h1>Home Count: {{ store.count }}</h1>
    <button aria-label="Inc" @click="store.inc()">Inc</button>
    <NuxtLink to="/about">Go About</NuxtLink>
  </main>
</template>

<script setup lang="ts">
import { useCounterStore } from '../stores/counter';
const store = useCounterStore();
</script>