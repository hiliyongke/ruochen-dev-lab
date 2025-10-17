# Vite 与 Webpack 实战

## Vite 基础项目（React/Vue 通用）
安装
```bash
# 任选其一
pnpm create vite my-app --template react-ts
# 或
pnpm create vite my-app --template vue-ts
cd my-app
pnpm i
pnpm dev
```

常用优化
- alias 与环境变量
- 构建拆包与可视化
- 基于插件的按需与压缩

vite.config.ts 示例
```ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// import vue from '@vitejs/plugin-vue'
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: { additionalData: '@use "@/styles/vars.scss" as *;' }
      }
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom']
          }
        }
      }
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    }
  };
});
```

依赖体积分析
```bash
pnpm add -D rollup-plugin-visualizer
```
```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';
export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [visualizer({ open: true })]
    }
  }
});
```

## Webpack 基础项目
安装
```bash
pnpm add -D webpack webpack-cli webpack-dev-server ts-loader typescript \
html-webpack-plugin css-loader style-loader sass sass-loader \
@babel/core babel-loader @babel/preset-env @babel/preset-typescript
```

webpack.config.js 示例
```js
const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV ?? 'development',
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/[name].[contenthash:8].js',
    clean: true
  },
  devtool: 'source-map',
  devServer: {
    port: 5173,
    hot: true,
    open: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.s?css$/, use: ['style-loader', 'css-loader', 'sass-loader'] }
    ]
  },
  optimization: {
    splitChunks: { chunks: 'all' }
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html' })
  ]
};
```

## 本章目的
- 明确 Vite 与 Webpack 的适用场景与取舍维度
- 提供可复制的产物可视化与体积分析方案
- 给出常见优化清单与性能预算落地方法

何时选 Vite vs Webpack
- Vite：开发体验、HMR 快、前端应用首选
- Webpack：深度自定义构建流程、微前端老项目兼容、特定 loader 生态

## 对比维度（简要）
- 开发体验：冷启动、HMR 时延、插件生态
- 构建速度：增量构建、缓存能力、并行压缩
- 产物质量：Tree-shaking、SplitChunks/手动拆包、侧效标记(sideEffects)
- 生态与扩展：插件/loader 丰富度、与遗留系统兼容性
- 团队维护：学习曲线、规则沉淀、排障成本

## 复制清单
- 可视化与分析
  - Vite：rollup-plugin-visualizer、source-map-explorer
  - Webpack：webpack-bundle-analyzer、stats.json + 分析
- 性能预算
  - Vite：build.chunkSizeWarningLimit
  - Webpack：performance.hints/maxAssetSize/maxEntrypointSize
- 拆包策略
  - Vite：rollupOptions.output.manualChunks
  - Webpack：optimization.splitChunks + cacheGroups
- 缓存与并行
  - Webpack：cache: { type: 'filesystem' }、并行压缩
  - Vite：依赖预构建 optimizeDeps、esbuild/rollup 并行

## 可运行示例：Webpack 体积可视化
安装
```bash
pnpm add -D webpack-bundle-analyzer
```
启用插件（webpack.config.js）
```js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  // ...其余配置
  plugins: [
    // 现有插件...
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // 生成静态HTML报告
      openAnalyzer: true,
      reportFilename: 'report.html'
    })
  ]
};
```

生成 stats.json 并分析
```bash
# 生成详细构建统计
pnpm webpack --profile --json=stats.json
# 也可使用 analyzer 读取 stats.json 进行离线分析
```

## 可运行示例：Source Map 体积分析（Vite/Webpack 通用）
安装
```bash
pnpm add -D source-map-explorer
```
使用（以 Vite 构建后的产物为例）
```bash
npx source-map-explorer "dist/assets/*.js" --html --no-border --only-mapped
```
说明
- 快速定位“大块头”依赖、重复引入与未摇树成功的模块
- 建议在 CI 归档 HTML 报告，便于回溯

## 产物验证清单
- Tree-shaking 有效性：确保依赖包声明 "sideEffects": false（或精确数组）
- 代码拆分：动态 import、路由/页面级懒加载
- 压缩与重复依赖：确认只保留一次依赖、排除 dev-only 包
- Source Map 策略：生产环境可选择 inline=false、只在 Sentry 等平台保留
- 产物完整性：CI 中生成校验（如 sha256）与清单，方便灰度与回滚

## 优化清单（精选）
- Vite
  - rollupOptions.output.manualChunks 拆 vendor/UI/业务模块
  - build.target/terser 配置与 esbuild 压缩对比
  - optimizeDeps.include/exclude 加速预构建
- Webpack
  - optimization.splitChunks: { chunks: 'all' } 并细化 cacheGroups
  - cache: { type: 'filesystem' } 持久化缓存
  - 压缩器并行与剔除注释，压缩 Source Map
  - 针对较慢 loader（如 babel-loader）配合 thread-loader（谨慎评估 I/O）

示例：Webpack 性能预算与缓存
```js
module.exports = {
  // ...
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000, // 500KB
    maxAssetSize: 256000       // 250KB
  },
  cache: { type: 'filesystem' }
};
```

示例：Vite 拆包与警戒值
```ts
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});
```

## 度量与自动化
- CI 输出：构建时长、产物大小 Top N、压缩后体积对比
- 产物报告归档：visualizer HTML、bundle-analyzer 报告、stats.json
- 趋势对比：与主分支/上次发布进行体积差异对照，超阈值拉红

## 常见坑与 FAQ
- 问：Tree-shaking 不生效？
  - 答：库未提供 ESM、sideEffects 未正确设置、存在通配导出等
- 问：产物突然变大如何定位？
  - 答：先跑 source-map-explorer 与可视化报告，对比依赖变化与重复打包
- 问：生产要不要生成 Source Map？
  - 答：建议生成并私有上传（Sentry等），产物包内不内联，避免泄露源码

## 参考链接
- Vite：https://vitejs.dev
- Webpack：https://webpack.js.org
- Visualizer：https://github.com/btd/rollup-plugin-visualizer
- Bundle Analyzer：https://github.com/webpack-contrib/webpack-bundle-analyzer
- Source Map Explorer：https://github.com/danvk/source-map-explorer