<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1>Vue 手册演示项目</h1>
        <p class="hero-description">
          这是一个基于 Vue 3 + TypeScript 的完整演示项目，展示了 Vue 手册中讲解的各种技术和最佳实践。
        </p>
        <div class="hero-actions">
          <button @click="goToTasks" class="btn btn-primary">
            开始使用
          </button>
          <button @click="showFeatures" class="btn btn-secondary">
            查看特性
          </button>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>项目特性</h2>
      <div class="feature-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.title">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <section class="tech-stack">
      <h2>技术栈</h2>
      <div class="tech-grid">
        <div class="tech-item" v-for="tech in techStack" :key="tech.name">
          <span class="tech-name">{{ tech.name }}</span>
          <span class="tech-version">{{ tech.version }}</span>
        </div>
      </div>
    </section>

    <section class="quick-start">
      <h2>快速开始</h2>
      <div class="code-example">
        <pre><code># 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 构建生产版本
npm run build</code></pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  {
    icon: '⚡',
    title: 'Vue 3 Composition API',
    description: '使用最新的 Composition API 进行组件开发，提供更好的类型推断和代码组织。'
  },
  {
    icon: '📊',
    title: '状态管理',
    description: '基于 Pinia 的状态管理方案，提供类型安全的状态管理和模块化组织。'
  },
  {
    icon: '🛣️',
    title: '路由管理',
    description: '使用 Vue Router 4 进行路由管理，支持路由守卫和懒加载。'
  },
  {
    icon: '🎨',
    title: 'UI 组件',
    description: '集成 Element Plus UI 组件库，提供丰富的组件和主题定制。'
  },
  {
    icon: '🧪',
    title: '测试支持',
    description: '完整的测试配置，支持单元测试和端到端测试。'
  },
  {
    icon: '📱',
    title: '响应式设计',
    description: '移动端友好的响应式设计，支持 PWA 特性。'
  }
]

const techStack = [
  { name: 'Vue', version: '3.3.x' },
  { name: 'TypeScript', version: '5.0.x' },
  { name: 'Pinia', version: '2.1.x' },
  { name: 'Vue Router', version: '4.2.x' },
  { name: 'Element Plus', version: '2.3.x' },
  { name: 'Vite', version: '4.3.x' },
  { name: 'Vitest', version: '0.31.x' },
  { name: 'ESLint', version: '8.0.x' }
]

const goToTasks = () => {
  router.push('/tasks')
}

const showFeatures = () => {
  document.querySelector('.features')?.scrollIntoView({ 
    behavior: 'smooth' 
  })
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin-bottom: 3rem;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.hero-description {
  font-size: 1.2rem;
  color: #546e7a;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover {
  background: #369b6d;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: #42b983;
  border: 2px solid #42b983;
}

.btn-secondary:hover {
  background: #42b983;
  color: white;
}

.features {
  margin-bottom: 3rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.tech-stack {
  margin-bottom: 3rem;
}

.tech-stack h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.tech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #42b983;
}

.tech-name {
  font-weight: bold;
  color: #2c3e50;
}

.tech-version {
  color: #78909c;
  font-size: 0.9rem;
}

.quick-start h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.code-example {
  background: #2d3748;
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
}

.code-example pre {
  margin: 0;
  color: #e2e8f0;
  font-family: 'Monaco', 'Consolas', monospace;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>