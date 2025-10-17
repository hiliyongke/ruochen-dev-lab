<template>
  <div class="task-item" :class="{ 'task-completed': task.completed }">
    <div class="task-content">
      <div class="task-checkbox">
        <input
          type="checkbox"
          :checked="task.completed"
          @change="$emit('toggle', task.id)"
          class="checkbox-input"
        />
      </div>
      
      <div class="task-details">
        <h3 class="task-title" :class="{ 'completed': task.completed }">
          {{ task.title }}
        </h3>
        
        <p class="task-description">{{ task.description }}</p>
        
        <div class="task-meta">
          <span class="task-priority" :class="`priority-${task.priority}`">
            {{ getPriorityText(task.priority) }}
          </span>
          
          <span class="task-date">
            创建: {{ formatDate(task.createdAt) }}
          </span>
          
          <span v-if="task.dueDate" class="task-due">
            截止: {{ formatDate(task.dueDate) }}
          </span>
        </div>
        
        <div v-if="task.tags.length > 0" class="task-tags">
          <span
            v-for="tag in task.tags"
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <div class="task-actions">
        <button
          @click="$emit('edit', task)"
          class="btn btn-edit"
          title="编辑任务"
        >
          ✏️
        </button>
        
        <button
          @click="$emit('delete', task.id)"
          class="btn btn-delete"
          title="删除任务"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '@/types/task'

defineProps<{
  task: Task
}>()

defineEmits<{
  toggle: [id: string]
  edit: [task: Task]
  delete: [id: string]
}>()

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
</script>

<style scoped>
.task-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.task-item.task-completed {
  opacity: 0.7;
  background-color: #f8f9fa;
}

.task-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.task-checkbox {
  flex-shrink: 0;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.task-details {
  flex: 1;
  min-width: 0;
}

.task-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  word-wrap: break-word;
}

.task-title.completed {
  text-decoration: line-through;
  color: #78909c;
}

.task-description {
  margin: 0 0 1rem 0;
  color: #546e7a;
  line-height: 1.4;
  word-wrap: break-word;
}

.task-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.task-priority {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.priority-high {
  background-color: #ffebee;
  color: #c62828;
}

.priority-medium {
  background-color: #fff3e0;
  color: #ef6c00;
}

.priority-low {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.task-date,
.task-due {
  color: #78909c;
}

.task-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: scale(1.1);
}

.btn-edit:hover {
  background-color: #e3f2fd;
}

.btn-delete:hover {
  background-color: #ffebee;
}

@media (max-width: 768px) {
  .task-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .task-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .task-actions {
    align-self: flex-end;
  }
}
</style>