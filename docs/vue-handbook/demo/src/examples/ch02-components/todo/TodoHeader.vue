<template>
  <div class="todo-header">
    <input
      v-model="text"
      placeholder="输入待办事项，按回车或点击添加"
      @keyup.enter="submit"
    />
    <button @click="submit">添加</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits({ 'add-todo': v => typeof v === 'string' })

const text = ref('')
function submit() {
  const t = text.value.trim()
  if (!t) return
  emit('add-todo', t)
  text.value = ''
}
</script>

<style scoped>
.todo-header { display: flex; gap: 8px; }
input { flex: 1; padding: 6px 8px; border: 1px solid #ddd; border-radius: 6px; }
button { padding: 6px 12px; border: 1px solid #2f54eb; background: #2f54eb; color: #fff; border-radius: 6px; cursor: pointer; }
</style>