<template>
  <div class="wrap">
    <h3>生命周期示例（Options / Composition 对照）</h3>
    <section>
      <h4>Options API</h4>
      <OptionsLife />
    </section>
    <section>
      <h4>Composition API（script setup）</h4>
      <CompositionLife />
    </section>
  </div>
</template>

<script>
import OptionsLife from './OptionsLifeInner.vue'
import CompositionLife from './CompositionLifeInner.vue'
export default { components: { OptionsLife, CompositionLife } }
</script>

<style scoped>
.wrap { display: grid; gap: 16px; }
section { border: 1px solid #eee; border-radius: 8px; padding: 12px; }
</style>