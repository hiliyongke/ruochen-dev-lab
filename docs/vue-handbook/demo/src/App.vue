<template>
  <div class="app">
    <h1>Vue 手册 Demo</h1>
    <nav class="nav">
      <button
        v-for="k in Object.keys(panels)"
        :key="k"
        @click="current = k"
        :class="{ active: current === k }"
      >
        {{ k }}
      </button>
    </nav>

    <section class="panel">
      <component :is="panels[current]" />
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

/**
 * 第01章示例
 */
import BasicSFC from './examples/ch01-basic/BasicSFC.vue'
import TemplateSyntax from './examples/ch01-basic/TemplateSyntax.vue'
import LifecycleDemo from './examples/ch01-basic/LifecycleDemo.vue'

/**
 * 第02章示例
 */
import Counter from './examples/ch02-components/Counter.vue'
import ParentComponent from './examples/ch02-components/ParentComponent.vue'
import DynamicTabs from './examples/ch02-components/DynamicTabs.vue'
import TodoApp from './examples/ch02-components/todo/TodoApp.vue'

const panels = {
  // ch01
  'Ch01-BasicSFC': BasicSFC,
  'Ch01-TemplateSyntax': TemplateSyntax,
  'Ch01-Lifecycle': LifecycleDemo,
  // ch02
  'Ch02-Counter': Counter,
  'Ch02-ParentComponent': ParentComponent,
  'Ch02-DynamicTabs': DynamicTabs,
  'Ch02-TodoApp': TodoApp
}

const current = ref('Ch01-BasicSFC')
</script>

<style scoped>
.app { max-width: 960px; margin: 24px auto; padding: 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
.nav { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 20px; }
.nav button { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; }
.nav button.active { background: #2f54eb; color: #fff; border-color: #2f54eb; }
.panel { border: 1px solid #eee; border-radius: 8px; padding: 16px; }
</style>