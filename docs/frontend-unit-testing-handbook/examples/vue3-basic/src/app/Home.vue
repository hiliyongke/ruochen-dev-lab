<template>
  <div>
    <h1>Home Count: {{ count }}</h1>
    <button aria-label="inc" @click="inc">Inc</button>
  </div>
</template>

<script setup lang="ts">
import { useAppState } from './state';
const { count, inc } = useAppState();
</script>