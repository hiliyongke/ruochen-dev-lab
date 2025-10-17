<template>
  <div class="todo-footer">
    <span>总数：{{ stats.total }}</span>
    <span>已完成：{{ stats.completed }}</span>
    <span>未完成：{{ stats.total - stats.completed }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: {
    type: Object,
    default: () => ({ total: 0, completed: 0 })
  }
})
</script>

<style scoped>
.todo-footer { display: flex; gap: 16px; padding-top: 8px; border-top: 1px dashed #eee; color: #555; }
</style>