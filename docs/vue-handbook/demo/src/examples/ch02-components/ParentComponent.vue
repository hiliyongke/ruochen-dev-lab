<template>
  <div class="parent">
    <h3>父子通信与 v-model 示例</h3>
    <ChildComponent v-model="message" @custom-event="handleCustomEvent" />
    <p>父组件中的 message: {{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const message = ref('')
function handleCustomEvent(data) {
  console.log('收到自定义事件:', data)
}
</script>

<style scoped>
.parent { display: grid; gap: 10px; }
</style>