import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isLoggedIn, getCurrentUser, logout as authLogout } from '@/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<string | null>(getCurrentUser())

  const isAuthenticated = computed(() => isLoggedIn())

  const login = (email: string) => {
    user.value = email
  }

  const logout = () => {
    authLogout()
    user.value = null
  }

  const checkAuth = () => {
    if (isLoggedIn()) {
      user.value = getCurrentUser()
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }
})
