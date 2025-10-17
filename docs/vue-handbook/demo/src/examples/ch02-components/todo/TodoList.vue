<template>
  <ul class="todo-list">
    <li v-for="t in todos" :key="t.id" :class="{ completed: t.completed }">
      <label>
        <input type="checkbox" :checked="t.completed" @change="$emit('toggle-todo', t.id)" />
        <span>{{ t.text }}</span>
      </label>
      <button class="danger" @click="$emit('delete-todo', t.id)">删除</button>
    </li>
    <li v-if="!todos.length" class="empty">暂无待办，先添加一条任务吧～</li>
  </ul>
</template>

<script setup>
const props = defineProps({
  todos: { type: Array, default: () => [] }
})
defineEmits({
  'toggle-todo': id => typeof id === 'number',
  'delete-todo': id => typeof id === 'number'
})
</script>

<style scoped>
.todo-list { display: grid; gap: 8px; padding-left: 0; list-style: none; }
.todo-list li { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border: 1px solid #eee; border-radius: 6px; }
.todo-list li.completed span { text-decoration: line-through; color: #999; }
.todo-list .danger { border: 1px solid #ff7875; background: #ff7875; color: #fff; border-radius: 6px; padding: 4px 10px; cursor: pointer; }
.empty { color: #999; font-style: italic; text-align: center; padding: 12px 0; }
</style>