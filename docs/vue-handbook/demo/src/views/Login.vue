<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>欢迎回来</h1>
        <p>请登录您的账户</p>
      </div>

      <el-form 
        :model="form" 
        :rules="rules" 
        ref="loginForm"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="demo-credentials">
        <h3>演示账户</h3>
        <p>用户名: <code>demo</code></p>
        <p>密码: <code>demo123</code></p>
      </div>

      <div class="login-footer">
        <p>还没有账户？ <a href="#" @click="showRegister">立即注册</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginForm.value) return

  try {
    // 验证表单
    await loginForm.value.validate()
    
    loading.value = true
    
    // 调用登录方法
    await authStore.login(form)
    
    ElMessage.success('登录成功！')
    
    // 跳转到首页
    router.push('/')
    
  } catch (error: any) {
    if (error?.errors) {
      // 表单验证错误
      ElMessage.error('请检查表单输入')
    } else {
      // 登录失败错误
      ElMessage.error(error?.message || '登录失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

const showRegister = () => {
  ElMessage.info('注册功能正在开发中...')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #78909c;
}

.login-form {
  margin-bottom: 2rem;
}

.login-button {
  width: 100%;
  margin-top: 1rem;
}

.demo-credentials {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 4px solid #42b983;
}

.demo-credentials h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
}

.demo-credentials p {
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: #546e7a;
}

.demo-credentials code {
  background: #e3f2fd;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
}

.login-footer {
  text-align: center;
  border-top: 1px solid #e0e0e0;
  padding-top: 1rem;
}

.login-footer p {
  margin: 0;
  color: #78909c;
  font-size: 0.9rem;
}

.login-footer a {
  color: #42b983;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
    margin: 1rem;
  }
}
</style>