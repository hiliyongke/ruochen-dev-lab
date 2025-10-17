<template>
  <div class="todo-app">
    <TodoHeader @add-todo="addTodo" />
    <TodoList :todos="todos" @toggle-todo="toggleTodo" @delete-todo="deleteTodo" />
    <TodoFooter :stats="stats" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TodoHeader from './TodoHeader.vue'
import TodoList from './TodoList.vue'
import TodoFooter from './TodoFooter.vue'

const todos = ref([])

function addTodo(text) {
  const t = text?.trim()
  if (!t) return
  todos.value.push({ id: Date.now(), text: t, completed: false })
}
function toggleTodo(id) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.completed = !todo.completed
}
function deleteTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id)
}

const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(t => t.completed).length
  return { total, completed }
})
</script>

<style scoped>
.todo-app { display: grid; gap: 12px; }
</style>