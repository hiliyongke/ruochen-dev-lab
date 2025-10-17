<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-description">
        抱歉，您访问的页面不存在或已被移动。
      </p>
      <div class="error-actions">
        <el-button type="primary" @click="goHome" size="large">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button @click="goBack" size="large">
          <el-icon><ArrowLeft /></el-icon>
          返回上页
        </el-button>
      </div>
      <div class="error-tips">
        <p>或者您可以：</p>
        <ul>
          <li>检查 URL 是否正确</li>
          <li>使用搜索功能查找内容</li>
          <li>联系管理员报告问题</li>
        </ul>
      </div>
    </div>
    
    <div class="error-illustration">
      <div class="illustration-container">
        <div class="lost-astronaut">👨‍🚀</div>
        <div class="floating-planets">
          <span class="planet">🪐</span>
          <span class="planet">🌍</span>
          <span class="planet">🌕</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  color: white;
  max-width: 500px;
  z-index: 1;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.error-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.error-description {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.error-tips {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.error-tips p {
  margin-bottom: 1rem;
  font-weight: 500;
}

.error-tips ul {
  text-align: left;
  margin: 0;
  padding-left: 1.5rem;
}

.error-tips li {
  margin-bottom: 0.5rem;
}

.error-illustration {
  position: absolute;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
}

.illustration-container {
  position: relative;
}

.lost-astronaut {
  font-size: 8rem;
  animation: float 3s ease-in-out infinite;
}

.floating-planets {
  position: absolute;
  top: -50px;
  right: -100px;
}

.planet {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
  animation: spin 10s linear infinite;
}

.planet:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 15s;
}

.planet:nth-child(3) {
  animation-delay: -6s;
  animation-duration: 20s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .not-found {
    flex-direction: column;
    text-align: center;
  }
  
  .error-illustration {
    position: relative;
    right: auto;
    top: auto;
    transform: none;
    margin-top: 2rem;
  }
  
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .lost-astronaut {
    font-size: 6rem;
  }
  
  .floating-planets {
    position: relative;
    top: auto;
    right: auto;
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .planet {
    font-size: 2rem;
    margin-bottom: 0;
  }
}
</style>