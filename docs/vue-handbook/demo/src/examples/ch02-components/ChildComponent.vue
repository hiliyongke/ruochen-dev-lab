<template>
  <div class="child">
    <input
      :value="modelValue"
      @input="onInput($event.target.value)"
      placeholder="子组件输入，同步父组件 v-model"
    />
    <button @click="emit('custom-event', '数据')">触发事件</button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits({
  'update:modelValue': v => typeof v === 'string',
  'custom-event': v => v !== undefined
})

function onInput(val) {
  emit('update:modelValue', val)
}
</script>

<style scoped>
.child { display: flex; gap: 8px; align-items: center; }
</style>