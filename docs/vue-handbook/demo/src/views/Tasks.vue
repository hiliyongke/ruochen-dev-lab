<template>
  <div class="tasks-page">
    <div class="page-header">
      <h1>任务管理</h1>
      <p>管理您的日常任务和项目</p>
    </div>

    <div class="tasks-controls">
      <div class="controls-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索任务..."
          clearable
          prefix-icon="Search"
          class="search-input"
        />
        
        <el-select v-model="filter" class="filter-select">
          <el-option label="全部任务" value="all" />
          <el-option label="未完成" value="active" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </div>

      <div class="controls-right">
        <el-button type="primary" @click="showCreateDialog" icon="Plus">
          新建任务
        </el-button>
        
        <el-button 
          v-if="stats.completed > 0"
          @click="clearCompleted"
          type="danger"
          plain
        >
          清除已完成
        </el-button>
      </div>
    </div>

    <div class="tasks-stats">
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <span class="stat-label">总计</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </el-card>
      
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <span class="stat-label">未完成</span>
          <span class="stat-value">{{ stats.active }}</span>
        </div>
      </el-card>
      
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value">{{ stats.completed }}</span>
        </div>
      </el-card>
      
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <span class="stat-label">已过期</span>
          <span class="stat-value">{{ stats.overdue }}</span>
        </div>
      </el-card>
    </div>

    <div class="tasks-list">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <el-empty description="暂无任务">
          <el-button type="primary" @click="showCreateDialog">
            创建第一个任务
          </el-button>
        </el-empty>
      </div>

      <el-card 
        v-for="task in filteredTasks" 
        :key="task.id"
        class="task-card"
        :class="{ 'task-completed': task.completed }"
      >
        <div class="task-content">
          <div class="task-main">
            <div class="task-header">
              <el-checkbox 
                v-model="task.completed"
                @change="toggleTaskCompletion(task.id)"
                class="task-checkbox"
              />
              
              <h3 class="task-title" :class="{ 'completed-text': task.completed }">
                {{ task.title }}
              </h3>
              
              <el-tag 
                :type="getPriorityType(task.priority)"
                size="small"
                class="priority-tag"
              >
                {{ getPriorityText(task.priority) }}
              </el-tag>
            </div>
            
            <p class="task-description">{{ task.description }}</p>
            
            <div class="task-meta">
              <span class="task-date">
                <el-icon><Calendar /></el-icon>
                创建: {{ formatDate(task.createdAt) }}
              </span>
              
              <span v-if="task.dueDate" class="task-due">
                <el-icon><Clock /></el-icon>
                截止: {{ formatDate(task.dueDate) }}
                <el-tag 
                  v-if="isOverdue(task)"
                  type="danger"
                  size="small"
                >
                  已过期
                </el-tag>
              </span>
            </div>
            
            <div class="task-tags">
              <el-tag
                v-for="tag in task.tags"
                :key="tag"
                size="small"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          
          <div class="task-actions">
            <el-button 
              size="small" 
              @click="editTask(task)"
              icon="Edit"
            >
              编辑
            </el-button>
            
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteTask(task.id)"
              icon="Delete"
              plain
            >
              删除
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 创建/编辑任务对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="editingTask ? '编辑任务' : '新建任务'"
      width="500px"
    >
      <el-form :model="taskForm" :rules="taskRules" ref="taskFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="taskForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="taskForm.priority" placeholder="请选择优先级">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="taskForm.dueDate"
            type="date"
            placeholder="选择截止日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select
            v-model="taskForm.tags"
            multiple
            filterable
            allow-create
            placeholder="添加标签"
          >
            <el-option 
              v-for="tag in availableTags" 
              :key="tag" 
              :label="tag" 
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitTaskForm" :loading="submitting">
          {{ editingTask ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Task, TaskFormData } from '@/types/task'

const tasksStore = useTasksStore()

// 响应式数据
const searchQuery = ref('')
const filter = ref<'all' | 'active' | 'completed'>('all')
const showDialog = ref(false)
const editingTask = ref<Task | null>(null)
const submitting = ref(false)
const taskFormRef = ref()

// 任务表单数据
const taskForm = ref<TaskFormData>({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: undefined,
  tags: []
})

// 表单验证规则
const taskRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 3, max: 100, message: '标题长度在 3 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入任务描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 计算属性
const filteredTasks = computed(() => tasksStore.filteredTasks)
const stats = computed(() => tasksStore.stats)

const availableTags = computed(() => {
  const allTags = tasksStore.tasks.flatMap(task => task.tags)
  return [...new Set(allTags)]
})

// 方法
const showCreateDialog = () => {
  editingTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: undefined,
    tags: []
  }
  showDialog.value = true
}

const editTask = (task: Task) => {
  editingTask.value = task
  taskForm.value = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    tags: [...task.tags]
  }
  showDialog.value = true
}

const submitTaskForm = async () => {
  if (!taskFormRef.value) return

  try {
    // 验证表单
    await taskFormRef.value.validate()
    
    submitting.value = true
    
    if (editingTask.value) {
      // 更新任务
      await tasksStore.updateTask(editingTask.value.id, taskForm.value)
      ElMessage.success('任务更新成功')
    } else {
      // 创建新任务
      await tasksStore.addTask(taskForm.value)
      ElMessage.success('任务创建成功')
    }
    
    showDialog.value = false
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入')
  } finally {
    submitting.value = false
  }
}

const toggleTaskCompletion = (taskId: string) => {
  tasksStore.toggleTaskCompletion(taskId)
}

const deleteTask = async (taskId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    tasksStore.deleteTask(taskId)
    ElMessage.success('任务删除成功')
  } catch {
    // 用户取消删除
  }
}

const clearCompleted = async () => {
  try {
    await ElMessageBox.confirm('确定要清除所有已完成的任务吗？', '确认清除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    tasksStore.clearCompleted()
    ElMessage.success('已完成任务已清除')
  } catch {
    // 用户取消清除
  }
}

const getPriorityType = (priority: string) => {
  switch (priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'info'
  }
}

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高优先级'
    case 'medium': return '中优先级'
    case 'low': return '低优先级'
    default: return priority
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const isOverdue = (task: Task) => {
  if (!task.dueDate || task.completed) return false
  return new Date(task.dueDate) < new Date()
}

// 监听筛选条件变化
tasksStore.setFilter(filter.value)
tasksStore.setSearchQuery(searchQuery.value)

onMounted(() => {
  // 初始化时加载任务数据
  tasksStore.fetchTasks()
})
</script>

<style scoped>
.tasks-page {
  max-width: 1000px;
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

.tasks-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.controls-left {
  display: flex;
  gap: 1rem;
  flex: 1;
  max-width: 400px;
}

.search-input {
  flex: 1;
}

.filter-select {
  width: 120px;
}

.controls-right {
  display: flex;
  gap: 1rem;
}

.tasks-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #78909c;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #42b983;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.task-card {
  transition: all 0.3s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-completed {
  opacity: 0.7;
  background-color: #f8f9fa;
}

.task-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.task-main {
  flex: 1;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.task-checkbox {
  margin-right: 0.5rem;
}

.task-title {
  margin: 0;
  flex: 1;
}

.completed-text {
  text-decoration: line-through;
  color: #78909c;
}

.priority-tag {
  flex-shrink: 0;
}

.task-description {
  color: #546e7a;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #78909c;
}

.task-date,
.task-due {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag-item {
  margin-right: 0.5rem;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .tasks-page {
    padding: 1rem;
  }

  .tasks-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .controls-left {
    max-width: none;
  }

  .controls-right {
    justify-content: center;
  }

  .task-content {
    flex-direction: column;
  }

  .task-actions {
    align-self: flex-end;
  }

  .task-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>