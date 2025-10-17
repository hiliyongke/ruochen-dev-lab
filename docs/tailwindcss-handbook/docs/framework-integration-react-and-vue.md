# 框架集成：React 与 Vue（Vite 模板与常见坑）

你将学到什么
- 在 React/Vue（Vite）项目中集成 Tailwind 的标准做法
- 正确配置 content 扫描、PostCSS 与 @tailwind 指令
- 典型组件写法、动态类名映射、常见冲突与调试技巧
- CDN 快速试跑与构建链路对照

前置知识
- 熟悉第 01~09 章内容，尤其是 content 扫描策略与变体用法

一、React + Vite 集成
1) 安装依赖
```bash
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2) 配置 tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: { brand: { 500:'#3BA4F0', 600:'#1E7FC1' } },
    maxWidth: { prose: '72ch' }
  }},
  plugins: [],
}
```

3) 配置 src/index.css（或 src/styles/index.css）
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 可选：基础排版微调 */
@layer base {
  h1,h2,h3 { @apply font-bold text-slate-100; }
  p { @apply text-slate-300 leading-7; }
}
```

4) 在入口导入样式
```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
```

5) 典型组件写法与动态类名映射
```tsx
// src/App.tsx
const colorMap = {
  success: 'text-emerald-600',
  warn: 'text-amber-600',
  error: 'text-rose-600',
} as const

export default function App() {
  const [state, setState] = React.useState<keyof typeof colorMap>('success')
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <h1 className="text-3xl font-bold">React + Tailwind</h1>
      <p className="mt-3">状态标签使用“显式映射”避免动态拼接被裁剪：</p>
      <span className={`inline-flex items-center rounded px-2 py-0.5 text-sm bg-slate-900/40 ring-1 ring-slate-800 ${colorMap[state]}`}>状态：{state}</span>
      <div className="mt-4 flex gap-2">
        {(['success','warn','error'] as const).map(k => (
          <button key={k} className="rounded border border-slate-700 px-2 py-1 hover:border-slate-500" onClick={()=>setState(k)}>{k}</button>
        ))}
      </div>
    </main>
  )
}
```

6) 常见坑（React）
- 动态类名：不要写 `text-${color}-600`；改用映射表或 safelist
- 类名顺序：建议配合 eslint-plugin-tailwindcss 的 classnames-order
- UI 库冲突：考虑 prefix（如 'tw-'）或 important: '#root' 容器重要性
- SSR/框架（Next）：确保 content 覆盖 .(js|ts|jsx|tsx|mdx) 与 app/ 或 pages/ 目录

二、Vue + Vite 集成
1) 安装依赖
```bash
npm create vite@latest my-vue-app -- --template vue-ts
cd my-vue-app
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2) 配置 tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{vue,js,ts}'],
  theme: { extend: {
    colors: { brand: { 500:'#3BA4F0', 600:'#1E7FC1' } },
  }},
  plugins: [],
}
```

3) src/assets/main.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4) 入口导入
```ts
// src/main.ts
import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'
createApp(App).mount('#app')
```

5) 组件示例
```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
const state = ref<'ok'|'warn'|'err'>('ok')
const map: Record<string,string> = {
  ok:'text-emerald-300 bg-emerald-900/30 ring-1 ring-emerald-700/50',
  warn:'text-amber-300 bg-amber-900/30 ring-1 ring-amber-700/50',
  err:'text-rose-300 bg-rose-900/30 ring-1 ring-rose-700/50',
}
</script>

<template>
  <main class="min-h-screen bg-slate-950 text-slate-100 p-6">
    <h1 class="text-3xl font-bold">Vue + Tailwind</h1>
    <span class="inline-flex items-center rounded px-2 py-0.5 text-sm" :class="map[state]">状态：{{ state }}</span>
    <div class="mt-4 flex gap-2">
      <button class="rounded border border-slate-700 px-2 py-1 hover:border-slate-500" @click="state='ok'">ok</button>
      <button class="rounded border border-slate-700 px-2 py-1 hover:border-slate-500" @click="state='warn'">warn</button>
      <button class="rounded border border-slate-700 px-2 py-1 hover:border-slate-500" @click="state='err'">err</button>
    </div>
  </main>
</template>
```

6) 常见坑（Vue）
- 动态类名：尽量以映射表绑定 :class，避免字符串模板拼接
- 单文件组件扫描：content 必须包含 .vue
- 指令/条件渲染导致类缺失：v-if/v-for 不影响 JIT，只要类名出现在源码里即可

三、CDN 快速试跑（无需脚手架）
- React CDN 示例：assets/examples/react-cdn.html（React 18 UMD + Babel Standalone + Tailwind CDN）
- Vue CDN 示例：assets/examples/vue-cdn.html（Vue 3 + Tailwind CDN）
说明：CDN 模式用于学习/演示，生产建议使用构建链路以裁剪体积与启用插件

四、通用最佳实践与常见坑
- content 覆盖一切模板来源：.html/.jsx/.tsx/.vue/.mdx 以及 SSR 框架特定目录
- 动态类名禁忌：改映射表，必要时 safelist（正则需谨慎）
- 与第三方样式冲突：prefix 或 important 容器优先于全局 !important
- 令牌与 theme.extend 同步：减少任意值散落
- 评审清单：对比度、dark、焦点可访问性、类名顺序、体积与裁剪日志

附：常用配置片段
- postcss.config.js
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```
- package.json scripts
```json
{
  "scripts": { "dev":"vite", "build":"vite build", "preview":"vite preview" }
}