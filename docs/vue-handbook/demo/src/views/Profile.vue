<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>个人中心</h1>
      <p>管理您的个人信息和账户设置</p>
    </div>

    <div class="profile-content">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <el-card class="profile-card">
            <template #header>
              <div class="card-header">
                <span>个人信息</span>
              </div>
            </template>

            <div class="avatar-section">
              <el-avatar 
                :size="100" 
                :src="user?.avatar" 
                class="profile-avatar"
              >
                {{ user?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              
              <div class="avatar-actions">
                <el-button size="small" @click="showAvatarDialog">
                  更换头像
                </el-button>
              </div>
            </div>

            <div class="user-info">
              <div class="info-item">
                <label>用户名:</label>
                <span>{{ user?.username }}</span>
              </div>
              
              <div class="info-item">
                <label>邮箱:</label>
                <span>{{ user?.email }}</span>
              </div>
              
              <div class="info-item">
                <label>注册时间:</label>
                <span>{{ formatDate(user?.createdAt) }}</span>
              </div>
            </div>
          </el-card>

          <el-card class="stats-card">
            <template #header>
              <div class="card-header">
                <span>任务统计</span>
              </div>
            </template>

            <div class="stats-content">
              <div class="stat-item">
                <div class="stat-icon">📊</div>
                <div class="stat-details">
                  <div class="stat-number">{{ taskStats.total }}</div>
                  <div class="stat-label">总任务数</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">✅</div>
                <div class="stat-details">
                  <div class="stat-number">{{ taskStats.completed }}</div>
                  <div class="stat-label">已完成</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">⏳</div>
                <div class="stat-details">
                  <div class="stat-number">{{ taskStats.active }}</div>
                  <div class="stat-label">进行中</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="16">
          <el-card class="settings-card">
            <template #header>
              <div class="card-header">
                <span>账户设置</span>
              </div>
            </template>

            <el-tabs v-model="activeTab">
              <el-tab-pane label="基本信息" name="basic">
                <el-form 
                  :model="profileForm" 
                  :rules="profileRules" 
                  ref="profileFormRef"
                  label-width="100px"
                >
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="profileForm.username" />
                  </el-form-item>
                  
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="profileForm.email" type="email" />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button 
                      type="primary" 
                      @click="updateProfile"
                      :loading="updatingProfile"
                    >
                      保存更改
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <el-tab-pane label="安全设置" name="security">
                <el-form 
                  :model="securityForm" 
                  :rules="securityRules" 
                  ref="securityFormRef"
                  label-width="100px"
                >
                  <el-form-item label="当前密码" prop="currentPassword">
                    <el-input 
                      v-model="securityForm.currentPassword" 
                      type="password" 
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item label="新密码" prop="newPassword">
                    <el-input 
                      v-model="securityForm.newPassword" 
                      type="password" 
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input 
                      v-model="securityForm.confirmPassword" 
                      type="password" 
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button 
                      type="primary" 
                      @click="changePassword"
                      :loading="changingPassword"
                    >
                      修改密码
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <el-tab-pane label="偏好设置" name="preferences">
                <div class="preference-section">
                  <h3>界面设置</h3>
                  
                  <div class="preference-item">
                    <label>主题模式:</label>
                    <el-radio-group v-model="preferences.theme">
                      <el-radio label="light">浅色</el-radio>
                      <el-radio label="dark">深色</el-radio>
                      <el-radio label="auto">自动</el-radio>
                    </el-radio-group>
                  </div>
                  
                  <div class="preference-item">
                    <label>语言:</label>
                    <el-select v-model="preferences.language">
                      <el-option label="中文" value="zh-CN" />
                      <el-option label="English" value="en-US" />
                    </el-select>
                  </div>
                  
                  <div class="preference-item">
                    <label>通知设置:</label>
                    <el-switch 
                      v-model="preferences.notifications" 
                      active-text="开启" 
                      inactive-text="关闭"
                    />
                  </div>
                </div>

                <div class="preference-actions">
                  <el-button type="primary" @click="savePreferences">
                    保存偏好
                  </el-button>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>

          <el-card class="danger-zone">
            <template #header>
              <div class="card-header danger-header">
                <span>危险操作</span>
              </div>
            </template>

            <div class="danger-content">
              <p class="danger-warning">
                ⚠️ 这些操作不可逆转，请谨慎操作
              </p>
              
              <div class="danger-actions">
                <el-button 
                  type="danger" 
                  plain 
                  @click="clearAllData"
                >
                  清除所有数据
                </el-button>
                
                <el-button 
                  type="danger" 
                  @click="deleteAccount"
                >
                  删除账户
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 头像选择对话框 -->
    <el-dialog
      v-model="showAvatarDialog"
      title="选择头像"
      width="400px"
    >
      <div class="avatar-options">
        <div 
          v-for="avatar in avatarOptions" 
          :key="avatar"
          class="avatar-option"
          :class="{ 'avatar-selected': selectedAvatar === avatar }"
          @click="selectedAvatar = avatar"
        >
          <el-avatar :size="60" :src="avatar" />
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showAvatarDialog = false">取消</el-button>
        <el-button type="primary" @click="updateAvatar">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { User } from '@/types/user'

const authStore = useAuthStore()
const tasksStore = useTasksStore()

// 响应式数据
const activeTab = ref('basic')
const showAvatarDialog = ref(false)
const selectedAvatar = ref('')
const updatingProfile = ref(false)
const changingPassword = ref(false)

const profileFormRef = ref()
const securityFormRef = ref()

// 用户信息
const user = computed(() => authStore.user)
const taskStats = computed(() => tasksStore.stats)

// 表单数据
const profileForm = ref({
  username: user.value?.username || '',
  email: user.value?.email || ''
})

const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const preferences = ref({
  theme: 'light',
  language: 'zh-CN',
  notifications: true
})

// 表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const securityRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value !== securityForm.value.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 头像选项
const avatarOptions = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png'
]

// 方法
const updateProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()
    updatingProfile.value = true

    await authStore.updateProfile(profileForm.value)
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    ElMessage.error('更新失败，请检查输入')
  } finally {
    updatingProfile.value = false
  }
}

const changePassword = async () => {
  if (!securityFormRef.value) return

  try {
    await securityFormRef.value.validate()
    changingPassword.value = true

    // 模拟密码修改
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('密码修改成功')
    
    // 清空表单
    securityForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    ElMessage.error('密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

const savePreferences = () => {
  localStorage.setItem('userPreferences', JSON.stringify(preferences.value))
  ElMessage.success('偏好设置已保存')
}

const updateAvatar = async () => {
  if (!selectedAvatar.value) {
    ElMessage.warning('请选择头像')
    return
  }

  try {
    await authStore.updateProfile({ avatar: selectedAvatar.value })
    showAvatarDialog.value = false
    ElMessage.success('头像更新成功')
  } catch (error) {
    ElMessage.error('头像更新失败')
  }
}

const showAvatarDialog = () => {
  selectedAvatar.value = user.value?.avatar || ''
  showAvatarDialog.value = true
}

const clearAllData = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将清除所有任务数据，且不可恢复。确定继续吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟清除数据
    tasksStore.tasks.length = 0
    ElMessage.success('数据清除成功')
  } catch {
    // 用户取消操作
  }
}

const deleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除您的账户，且不可恢复。确定继续吗？',
      '危险操作',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // 模拟账户删除
    authStore.logout()
    ElMessage.success('账户已删除')
  } catch {
    // 用户取消操作
  }
}

const formatDate = (date?: Date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  // 加载用户偏好设置
  const savedPreferences = localStorage.getItem('userPreferences')
  if (savedPreferences) {
    preferences.value = JSON.parse(savedPreferences)
  }

  // 初始化表单数据
  if (user.value) {
    profileForm.value = {
      username: user.value.username,
      email: user.value.email
    }
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #78909c;
  font-size: 1.1rem;
}

.profile-content {
  margin-top: 2rem;
}

.profile-card,
.stats-card,
.settings-card,
.danger-zone {
  margin-bottom: 1.5rem;
}

.card-header {
  font-weight: 600;
  color: #2c3e50;
}

.danger-header {
  color: #f56c6c;
}

.avatar-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  margin-bottom: 1rem;
}

.avatar-actions {
  margin-top: 1rem;
}

.user-info {
  margin-top: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 500;
  color: #606266;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-details {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #42b983;
}

.stat-label {
  font-size: 0.9rem;
  color: #78909c;
}

.preference-section {
  margin-bottom: 2rem;
}

.preference-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.preference-actions {
  text-align: right;
}

.danger-content {
  text-align: center;
}

.danger-warning {
  color: #f56c6c;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.danger-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.avatar-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.avatar-option {
  cursor: pointer;
  padding: 1rem;
  border: 2px solid transparent;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.avatar-option:hover {
  border-color: #42b983;
}

.avatar-selected {
  border-color: #42b983;
  background-color: #f0f9f4;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .preference-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .danger-actions {
    flex-direction: column;
  }

  .avatar-options {
    grid-template-columns: 1fr;
  }
}
</style>