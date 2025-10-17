<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo区域 -->
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <div class="brand-logo">⚡</div>
          <span class="brand-text">Vue手册Demo</span>
        </router-link>
      </div>

      <!-- 导航菜单 -->
      <div class="navbar-menu">
        <router-link 
          to="/" 
          class="nav-link"
          :class="{ active: $route.path === '/' }"
        >
          <el-icon><HomeFilled /></el-icon>
          首页
        </router-link>
        
        <router-link 
          to="/tasks" 
          class="nav-link"
          :class="{ active: $route.path === '/tasks' }"
        >
          <el-icon><List /></el-icon>
          任务管理
        </router-link>
        
        <router-link 
          v-if="isAuthenticated"
          to="/profile" 
          class="nav-link"
          :class="{ active: $route.path === '/profile' }"
        >
          <el-icon><User /></el-icon>
          个人中心
        </router-link>
      </div>

      <!-- 用户操作区域 -->
      <div class="navbar-actions">
        <div v-if="isAuthenticated" class="user-info">
          <el-dropdown>
            <span class="user-dropdown">
              <el-avatar :size="32" :src="user?.avatar" class="user-avatar">
                {{ user?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="user-name">{{ user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                
                <el-dropdown-item @click="showSettings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                
                <el-dropdown-item divided @click="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <div v-else class="auth-buttons">
          <el-button 
            type="primary" 
            @click="goToLogin"
            size="small"
          >
            登录
          </el-button>
          
          <el-button 
            @click="goToRegister"
            size="small"
          >
            注册
          </el-button>
        </div>

        <!-- 移动端菜单按钮 -->
        <button 
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
        >
          <el-icon><Menu /></el-icon>
        </button>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div v-if="showMobileMenu" class="mobile-menu">
      <div class="mobile-menu-content">
        <router-link 
          to="/" 
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          <el-icon><HomeFilled /></el-icon>
          首页
        </router-link>
        
        <router-link 
          to="/tasks" 
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          <el-icon><List /></el-icon>
          任务管理
        </router-link>
        
        <router-link 
          v-if="isAuthenticated"
          to="/profile" 
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          <el-icon><User /></el-icon>
          个人中心
        </router-link>
        
        <div v-if="isAuthenticated" class="mobile-user-section">
          <div class="mobile-user-info">
            <el-avatar :size="40" :src="user?.avatar">
              {{ user?.username?.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="mobile-user-details">
              <div class="mobile-user-name">{{ user?.username }}</div>
              <div class="mobile-user-email">{{ user?.email }}</div>
            </div>
          </div>
          
          <div class="mobile-user-actions">
            <el-button @click="goToProfile" size="small" class="mobile-action-btn">
              个人中心
            </el-button>
            <el-button @click="logout" type="danger" size="small" class="mobile-action-btn">
              退出登录
            </el-button>
          </div>
        </div>
        
        <div v-else class="mobile-auth-section">
          <el-button 
            type="primary" 
            @click="goToLogin"
            size="large"
            class="mobile-auth-btn"
          >
            登录
          </el-button>
          
          <el-button 
            @click="goToRegister"
            size="large"
            class="mobile-auth-btn"
          >
            注册
          </el-button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const showMobileMenu = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const goToLogin = () => {
  router.push('/login')
  closeMobileMenu()
}

const goToRegister = () => {
  router.push('/register')
  closeMobileMenu()
}

const goToProfile = () => {
  router.push('/profile')
  closeMobileMenu()
}

const showSettings = () => {
  ElMessage.info('设置功能开发中...')
  closeMobileMenu()
}

const logout = async () => {
  try {
    await authStore.logout()
    ElMessage.success('退出登录成功')
    closeMobileMenu()
    router.push('/')
  } catch (error) {
    ElMessage.error('退出登录失败')
  }
}
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 64px;
}

.navbar-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.2rem;
}

.brand-logo {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.brand-text {
  font-size: 1.1rem;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #606266;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  color: #42b983;
  background-color: #f0f9f4;
}

.nav-link.active {
  color: #42b983;
  background-color: #f0f9f4;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.user-dropdown:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  margin-right: 0.5rem;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.mobile-menu-btn:hover {
  background-color: #f5f5f5;
}

.mobile-menu {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 999;
  overflow-y: auto;
}

.mobile-menu-content {
  padding: 1rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-decoration: none;
  color: #606266;
  border-bottom: 1px solid #f0f0f0;
  font-size: 1.1rem;
  font-weight: 500;
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

.mobile-user-section {
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
  margin-top: 1rem;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mobile-user-details {
  flex: 1;
}

.mobile-user-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.mobile-user-email {
  font-size: 0.9rem;
  color: #78909c;
}

.mobile-user-actions {
  display: flex;
  gap: 0.5rem;
}

.mobile-action-btn {
  flex: 1;
}

.mobile-auth-section {
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-auth-btn {
  width: 100%;
}

@media (max-width: 768px) {
  .navbar-menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .auth-buttons {
    display: none;
  }
  
  .user-info {
    display: none;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 0.5rem;
  }
  
  .brand-text {
    font-size: 1rem;
  }
}
</style>