<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWishlist } from '@/composables/useWishlist'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { wishlistCount } = useWishlist()

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const handleLogout = () => {
  authStore.logout()
  router.push('/signin')
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="header-container">
      <div class="header-logo" @click="goHome">MOVIEFLIX</div>

      <nav class="header-nav">
        <RouterLink to="/" class="header-nav-link" :class="{ active: route.path === '/' }">
          <i class="fas fa-home"></i> 홈
        </RouterLink>
        <RouterLink
          to="/popular"
          class="header-nav-link"
          :class="{ active: route.path === '/popular' }"
        >
          <i class="fas fa-fire"></i> 인기
        </RouterLink>
        <RouterLink
          to="/search"
          class="header-nav-link"
          :class="{ active: route.path === '/search' }"
        >
          <i class="fas fa-search"></i> 검색
        </RouterLink>
        <RouterLink
          to="/wishlist"
          class="header-nav-link"
          :class="{ active: route.path === '/wishlist' }"
        >
          <i class="fas fa-heart"></i> 내 리스트
          <span v-if="wishlistCount > 0">({{ wishlistCount }})</span>
        </RouterLink>
      </nav>

      <div class="header-user">
        <span class="header-user-name">{{ authStore.user }}</span>
        <button class="btn btn-primary header-logout" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i> 로그아웃
        </button>
      </div>
    </div>
  </header>
</template>
