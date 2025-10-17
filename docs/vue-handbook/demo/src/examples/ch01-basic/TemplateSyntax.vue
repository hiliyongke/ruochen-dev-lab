<template>
  <div class="wrap">
    <h3>模板语法要点</h3>

    <section>
      <h4>1) 文本插值与原始 HTML</h4>
      <p>消息: {{ message }}</p>
      <p>原始 HTML：<span v-html="rawHtml"></span></p>
    </section>

    <section>
      <h4>2) :class 与 :style</h4>
      <div
        class="card"
        :class="['base', active && 'is-active']"
        :style="[{ color: color }, isWarn && { background: '#fffbe6' }]"
      >
        可切换样式/颜色
      </div>
      <button @click="active = !active">切换 active</button>
      <button @click="isWarn = !isWarn">切换 warn</button>
      <input v-model="color" placeholder="输入颜色，如 #333 或 red" />
    </section>

    <section>
      <h4>3) v-if vs v-show</h4>
      <label><input type="checkbox" v-model="showBox" /> 显示</label>
      <div v-if="showBox" class="box">v-if 区域（销毁/重建）</div>
      <div v-show="showBox" class="box">v-show 区域（CSS 显隐）</div>
    </section>

    <section>
      <h4>4) 事件与修饰符</h4>
      <form @submit.prevent="submit">
        <input v-model.trim="input" @keyup.enter="submit" placeholder="回车或提交" />
        <button type="submit">提交</button>
      </form>
      <p>最后提交：{{ lastSubmit }}</p>
    </section>

    <section>
      <h4>5) 列表渲染与 key</h4>
      <ul>
        <li v-for="it in items" :key="it.id">{{ it.text }}</li>
      </ul>
      <button @click="addItem">添加一项</button>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Template!')
const rawHtml = ref('<strong>加粗文本</strong>')

const active = ref(false)
const isWarn = ref(false)
const color = ref('#333')

const showBox = ref(true)

const input = ref('')
const lastSubmit = ref('')
function submit() {
  lastSubmit.value = input.value
}

const items = ref([
  { id: 1, text: '苹果' },
  { id: 2, text: '香蕉' }
])
function addItem() {
  const id = Date.now()
  items.value.push({ id, text: '新增项 ' + id })
}
</script>

<style scoped>
.wrap { display: grid; gap: 16px; }
.card { padding: 8px 12px; border: 1px solid #eee; border-radius: 8px; }
.base {}
.is-active { border-color: #2f54eb; }
.box { margin-top: 6px; padding: 8px 12px; border: 1px dashed #bbb; border-radius: 6px; }
form { display: flex; gap: 8px; align-items: center; }
ul { margin: 0; padding-left: 20px; }
</style>