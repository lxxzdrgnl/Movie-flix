<script setup lang="ts">
import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
}

const toasts = ref<Toast[]>([])
let toastId = 0

const addToast = (type: Toast['type'], title: string, message: string, duration: number = 3000) => {
  const id = toastId++
  toasts.value.push({ id, type, title, message })

  setTimeout(() => {
    removeToast(id)
  }, duration)
}

const removeToast = (id: number) => {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

const getIcon = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle'
    case 'error':
      return 'fas fa-times-circle'
    case 'warning':
      return 'fas fa-exclamation-triangle'
    case 'info':
      return 'fas fa-info-circle'
    default:
      return 'fas fa-info-circle'
  }
}

defineExpose({
  addToast,
})
</script>

<template>
  <div class="toast-container">
    <Transition name="slide" v-for="toast in toasts" :key="toast.id">
      <div class="toast" :class="toast.type">
        <i class="toast-icon" :class="getIcon(toast.type)"></i>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click="removeToast(toast.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </Transition>
  </div>
</template>
