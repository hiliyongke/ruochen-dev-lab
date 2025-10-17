# Vue 手册 Demo 使用说明

本 Demo 项目用于配合《深入浅出之Vue手册》文档示例进行运行与对照，当前已完成：
- 第 01 章「基础概念」示例
- 第 02 章「组件开发」示例

## 环境要求
- Node.js >= 18
- npm 或 pnpm（本文以 npm 为例）

## 安装与启动
```bash
cd demo
npm install
npm run dev
```
启动后访问浏览器 http://localhost:5173 即可。
如端口占用，可在 vite.config.ts 中修改 `server.port`。

## 示例导航
首页为聚合入口（src/App.vue），顶部按钮可切换不同示例：
- Ch01-BasicSFC（第01章：最小 SFC 示例）
- Ch01-TemplateSyntax（第01章：模板语法要点）
- Ch01-Lifecycle（第01章：生命周期示例）
- Ch02-Counter（第02章：组件基础）
- Ch02-ParentComponent（第02章：父子通信与 v-model）
- Ch02-DynamicTabs（第02章：动态组件）
- Ch02-TodoApp（第02章：Todo 组件拆分）

## 文件结构与文档映射

### 第01章（基础概念）
- src/examples/ch01-basic/BasicSFC.vue
  - 对应文档：最小 SFC 示例（script setup，Composition API）
- src/examples/ch01-basic/TemplateSyntax.vue
  - 对应文档：模板语法要点（:class/:style、v-if vs v-show、事件修饰符等）
- src/examples/ch01-basic/LifecycleDemo.vue
- src/examples/ch01-basic/OptionsLifeInner.vue
- src/examples/ch01-basic/CompositionLifeInner.vue
  - 对应文档：生命周期钩子（Options 与 Composition 对照）

### 第02章（组件开发）
- src/examples/ch02-components/Counter.vue
  - 对应文档：组件基本结构（Options 与 script setup 等价写法）
- src/examples/ch02-components/ChildComponent.vue
- src/examples/ch02-components/ParentComponent.vue
  - 对应文档：自定义事件、v-model 双向绑定、emits 校验
- src/examples/ch02-components/DynamicTabs.vue
- src/examples/ch02-components/tabs/Home.vue
- src/examples/ch02-components/tabs/Posts.vue
- src/examples/ch02-components/tabs/Archive.vue
  - 对应文档：动态组件（返回组件对象映射，避免字符串注册名不匹配）
- src/examples/ch02-components/todo/TodoApp.vue
- src/examples/ch02-components/todo/TodoHeader.vue
- src/examples/ch02-components/todo/TodoList.vue
- src/examples/ch02-components/todo/TodoFooter.vue
  - 对应文档：Todo 应用组件拆分（Header/List/Footer），增强了空列表提示与输入校验

## 常见问题
- TypeScript 提示“找不到模块”：
  - 原因：依赖未安装或首次打开工程。进入 demo 目录执行 `npm install` 后即可。
- SFC 类型声明：
  - 已添加 `src/vite-env.d.ts`：`/// <reference types="vite/client" />`
- 端口占用：
  - 默认端口 5173，如被占用可在 `vite.config.ts` 中修改。

## 备注
- 本 Demo 为文档示例的最小可运行版本。路由与 Pinia将在后续章节补充。
- 文档中提到的「性能建议」与「常见坑」在示例中已尽量避免，您可自行改动进行对比测试。