<template>
  <div class="posts">
    <h3>Posts</h3>
    <ul>
      <li v-for="p in posts" :key="p.id">{{ p.title }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const posts = ref([
  { id: 1, title: 'Vue 3 组件开发' },
  { id: 2, title: 'Pinia 状态管理入门' },
  { id: 3, title: 'Vue Router 路由与守卫' }
])
</script>

<style scoped>
.posts { padding: 8px 0; }
</style>