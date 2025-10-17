# 01. Vue.js 基础概念

> 本书采用 Vue 3 与 Composition API 为主线（同时给出 Options API 对照）；示例项目使用 Vite 构建。状态管理章节将使用 Pinia。

## 什么是 Vue.js？
Vue.js 是一套用于构建用户界面的渐进式框架。核心关注视图层，易上手、易集成，支持组件化、响应式、指令系统与单文件组件（SFC）。

### 核心特性
- 响应式数据绑定：数据变化驱动视图更新
- 组件化开发：拆分为可复用组件
- 虚拟 DOM：高效渲染
- 指令系统：声明式模板能力
- 单文件组件（SFC）：模板/逻辑/样式同文件组织

## 第一个应用（CDN 版，立即运行）
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>第一个 Vue 应用</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
  <div id="app">
    <h1>{{ message }}</h1>
    <button @click="reverseMessage">反转消息</button>
    <p>计数: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>

  <script>
    const { createApp } = Vue
    createApp({
      data() {
        return { message: 'Hello Vue!', count: 0 }
      },
      methods: {
        reverseMessage() { this.message = this.message.split('').reverse().join('') },
        increment() { this.count++ }
      }
    }).mount('#app')
  </script>
</body>
</html>
```

## 最小 SFC 示例（推荐工程化）
SFC 结构由三块组成：template / script / style
```vue
<!-- BasicSFC.vue -->
<template>
  <div class="box">
    <h3>{{ title }}</h3>
    <button @click="count++">count: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ title: { type: String, default: 'Hello Vue SFC' } })
const count = ref(0)
</script>

<style scoped>
.box { padding: 12px; border: 1px solid #eee; border-radius: 8px; }
</style>
```
- Composition API（script setup）是 Vue3 官方推荐；Options API 仍可用，后续章节提供对照。

## Vue 应用实例与配置（Options API 对照）
```js
// Options API
const app = Vue.createApp({
  data() {
    return { firstName: '张', lastName: '三', items: [{ id:1, text:'苹果' },{ id:2, text:'香蕉' }] }
  },
  computed: {
    fullName() { return this.firstName + this.lastName }
  },
  methods: {
    addItem(text) { this.items.push({ id: Date.now(), text }) }
  },
  watch: {
    firstName(n, o) { console.log(`firstName: ${o} -> ${n}`) }
  }
})
```
```vue
<!-- Composition API 等价（script setup） -->
<script setup>
import { ref, computed, watch } from 'vue'
const firstName = ref('张')
const lastName = ref('三')
const items = ref([{ id:1, text:'苹果' },{ id:2, text:'香蕉' }])
const fullName = computed(() => firstName.value + lastName.value)
function addItem(text){ items.value.push({ id: Date.now(), text }) }
watch(firstName, (n, o) => console.log(`firstName: ${o} -> ${n}`))
</script>
```

## 模板语法要点
- 文本插值与原始 HTML
```html
<span>消息: {{ message }}</span>
<p>使用 v-html：<span v-html="rawHtml"></span></p>
```
- 属性绑定与表达式
```html
<div :id="dynamicId"></div>
<p>{{ number + 1 }}</p>
<p>{{ ok ? 'YES' : 'NO' }}</p>
```
- :class 与 :style
```html
<div :class="['card', active && 'is-active']" :style="[{ color: color }, isWarn && { background: '#fffbe6' }]"></div>
```
- 事件与修饰符
```html
<button @click.stop.prevent="onClick">提交</button>
<input @keyup.enter="submit" />
<form @submit.prevent="onSubmit"></form>
```
- v-if vs v-show
  - v-if：条件变化触发销毁/重建，适合不常切换
  - v-show：通过 CSS 切换可见性，适合频繁切换

- 列表渲染与 key
```html
<li v-for="item in items" :key="item.id">{{ item.text }}</li>
```

- 双向绑定
```html
<input v-model="message">
```

提示：模板表达式应尽量保持无副作用与简单计算，复杂逻辑放到 computed/methods 中。

## 生命周期（Options API）
```js
export default {
  data(){ return { message:'Hello Vue!' } },
  beforeCreate(){ console.log('beforeCreate') },
  created(){ console.log('created') },
  beforeMount(){ console.log('beforeMount') },
  mounted(){ console.log('mounted') },
  beforeUpdate(){ console.log('beforeUpdate') },
  updated(){ console.log('updated') },
  beforeUnmount(){ console.log('beforeUnmount') },
  unmounted(){ console.log('unmounted') }
}
```
最佳实践与常见时机：
- 获取首屏数据：mounted 后或在路由守卫中（避免 SSR 环境中直接访问 window）
- 订阅/计时器：mounted 订阅，beforeUnmount 清理
- 性能观察：updated 后做轻量逻辑，避免引起连续重渲染

## 常见坑
- 在模板中执行重计算/副作用函数，导致性能抖动
- v-if 与 v-for 同层使用不当（推荐外层包裹或用计算属性先过滤）
- 未提供稳定 key 导致列表复用异常
- 误用 this 指向（Options API 中 methods 不要用箭头函数）
- 直接修改来自父组件的 prop（应通过本地副本或 v-model/emit）

## 小练习
- 实现一个计数器组件：支持 step、最小/最大值限制，溢出时高亮边框
- 扩展 class/style 绑定：支持 isWarn、isError 的可组合样式
- 添加一个输入表单：使用事件修饰符与 v-model 修饰符（.trim/.number）

## 与 demo 对应路径
- demo/src/examples/ch01-basic/BasicSFC.vue
- demo/src/examples/ch01-basic/TemplateSyntax.vue
- demo/src/examples/ch01-basic/LifecycleDemo.vue

## 总结
本章完成：Vue 基本概念、应用实例、模板语法关键点、生命周期与最佳实践；并提供 SFC/Composition 对照。下一章将进入组件系统，继续循序渐进（同时全书状态管理采用 Pinia）。