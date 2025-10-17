<template>
  <h1>About Count: {{ count }}</h1>
</template>

<script setup lang="ts">
import { useAppState } from './state';
const { count } = useAppState();
</script>