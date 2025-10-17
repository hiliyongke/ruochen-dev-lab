<template>
  <StateProvider>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </nav>
    <router-view />
  </StateProvider>
</template>

<script setup lang="ts">
import { StateProvider } from './state';
</script>