# 11. 构建裁剪、JIT、生产优化与调试清单

你将学到什么
- JIT 引擎工作原理与任意值/变体的生成时机
- content 扫描策略与 safelist 使用场景
- 动态类名（字符串拼接）导致样式缺失的常见陷阱与替代方案
- CLI/Vite 构建配置与 PostCSS/Tailwind 配置要点
- 产物体积优化、性能与可调试性平衡的清单化方法

前置知识
- 熟悉 Tailwind 核心用法、设计系统与主题化（第 02~07 章）
- 了解插件与配置（第 08~09 章）与实战页面（第 10 章）

一、JIT 工作原理（Just-in-Time）
- 触发机制：扫描 content 中的文件，解析出出现过的类名模式 → 按需生成 CSS
- 支持任意值/变体：如 bg-[#0ea5e9]、[mask-image:url(...)]、md:hover:… 等
- 生成粒度：按类名组合生成，未出现的类不会进入产物
- 实战含义：开发时几乎“无限类”，但生产时必须确保类名可被静态分析

二、content 扫描与 safelist
- 配置示例（tailwind.config.js）：
```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue,md,mdx}',
    './docs/**/*.{md,mdx}',
  ],
  theme: { extend: {} },
  plugins: [],
  safelist: [
    // 场景：运行期才知道主题色/状态色
    { pattern: /(bg|text|border)-(red|emerald|sky|amber)-(500|600)/ },
    // 或者枚举关键类
    'animate-pulse', 'line-clamp-3',
  ],
};
```
- 建议：
  1) 尽量让类名“静态可见”，避免运行期拼接
  2) 确需动态组合时，用映射表/字典，配合 safelist 的 pattern
  3) 扫描范围覆盖模板/组件/文档演示，否则会漏裁或过裁

三、动态类名陷阱与替代
- 反例（不推荐）：
```jsx
// ❌ 无法被静态分析：`bg-${color}-500`
<div className={`bg-${color}-500`}> ... </div>
```
- 推荐（映射表/白名单）：
```jsx
const COLOR_MAP = { primary: 'bg-sky-500', danger: 'bg-red-500' };
<div className={COLOR_MAP[color] ?? 'bg-slate-500'}>...</div>
```
- 任意值建议：若需 bg-[#123456]，请确保该字符串字面量存在于源码中

四、构建管线（CLI/Vite）
- Tailwind CLI（最小可用）：
```bash
# 开发
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
# 生产（自动按 content 裁剪）
NODE_ENV=production npx tailwindcss -i ./src/index.css -o ./dist/output.css --minify
```
- Vite + PostCSS 典型片段：
```js
// postcss.config.js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };

// src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// vite.config.ts（可选：视项目需要）
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true, // 开发期调试 CSS 源图
  },
});
```

五、产物体积优化策略
- content 精准：减少无关目录（如大体量 markdown/示例仓库），必要时添加忽略
- safelist 控制：优先使用 pattern，避免过多枚举
- 拆分与懒加载：路由/模块拆分，组件按需加载
- 选择器复杂度：优先原子类，少用深层嵌套选择器与过多 @layer 规则
- 图标与字体：采用 Icon 组件/按需打包/可变字体；避免大型图标字体全量引入
- 观察指标：dist CSS 体积、FCP/LCP、交互延迟；建立阈值报警（CI）

六、调试与问题定位
- 开发态：
  - 打开 devtools → Elements → 检查类名是否存在以及被哪些样式覆盖
  - 开启 css devSourcemap，定位到具体 @layer 与源文件
  - 将“疑似被裁剪”的类写成字面量测试（或暂时加入 safelist）验证
- 生产态：
  - 对照构建日志与 dist CSS 大小变化
  - 使用 Coverage/Source Map 检查未使用代码
  - 排查 CDN 与构建链的差异（CDN 不会按 content 裁剪）
- 常见坑 Checklist：
  1) 未把 mdx/md/vue/自定义模板后缀加入 content
  2) 使用动态拼接未配合映射表/safelist
  3) 误删 @tailwind utilities 导致工具类缺失
  4) @layer 顺序或 !important 冲突
  5) darkMode: 'class' 与 HTML 根节点 class 未同步

七、CI 与团队规范建议
- CI 步骤：lint → test → build（统计 CSS 体积）→ 预览环境
- 门禁：设定最大 CSS 体积阈值与新增 safelist 评审
- 文档化：维护“类名映射表/设计令牌/约束说明”与“调试清单”

练习
1) 将项目的 content 范围限制到 src 与必要的模版目录，观察 CSS 产物变化
2) 抽取一处动态颜色逻辑，改用映射表 + safelist 的 pattern 控制
3) 打开 devSourcemap，复现并定位一个“被覆盖”的样式冲突

参考
- Build/Optimization：https://tailwindcss.com/docs/optimizing-for-production
- Content/Safelist：https://tailwindcss.com/docs/content-configuration
- Vite：https://vitejs.dev/guide/