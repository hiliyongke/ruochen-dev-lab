<template>
  <div class="tabs">
    <div class="tab-bar">
      <button v-for="tab in tabs" :key="tab" :class="{ active: tab === current }" @click="current = tab">
        {{ tab }}
      </button>
    </div>
    <div class="tab-panel">
      <component :is="currentComp" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Home from './tabs/Home.vue'
import Posts from './tabs/Posts.vue'
import Archive from './tabs/Archive.vue'

const tabs = ['Home', 'Posts', 'Archive']
const current = ref('Home')
const currentComp = computed(() => ({ Home, Posts, Archive }[current.value]))
</script>

<style scoped>
.tab-bar { display: flex; gap: 8px; margin-bottom: 12px; }
.tab-bar button { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; }
.tab-bar button.active { background: #2f54eb; color: #fff; border-color: #2f54eb; }
.tab-panel { border: 1px solid #eee; padding: 12px; border-radius: 8px; }
</style>