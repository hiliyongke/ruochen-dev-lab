<template>
  <div class="options-life">
    <p>计数：{{ count }}</p>
    <button @click="increment">+1（触发更新）</button>
  </div>
</template>

<script>
export default {
  name: 'OptionsLifeInner',
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  beforeCreate() { console.log('[Options] beforeCreate') },
  created() { console.log('[Options] created') },
  beforeMount() { console.log('[Options] beforeMount') },
  mounted() { console.log('[Options] mounted') },
  beforeUpdate() { console.log('[Options] beforeUpdate') },
  updated() { console.log('[Options] updated') },
  beforeUnmount() { console.log('[Options] beforeUnmount') },
  unmounted() { console.log('[Options] unmounted') }
}
</script>

<style scoped>
.options-life { display: flex; gap: 8px; align-items: center; }
button { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; }
</style>