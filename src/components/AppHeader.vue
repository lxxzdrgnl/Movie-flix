<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useWishlist } from '@/composables/useWishlist'
import { useTheme } from '@/composables/useTheme'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { wishlistCount } = useWishlist()
const { currentTheme, toggleTheme } = useTheme()

const isDark = computed(() => currentTheme.value === 'dark')

const isScrolled = ref(false)
const showBrowseMenu = ref(false)
const showLanguageMenu = ref(false)
const showUserMenu = ref(false)

// 홈과 인기 페이지 확인
const isHeroPage = computed(() => {
  return route.path === '/' || route.path === '/popular'
})

// 헤더 배경 상태 계산
const headerScrolled = computed(() => {
  // 홈과 인기 페이지가 아니면 항상 scrolled 상태
  if (!isHeroPage.value) return true
  // 홈과 인기 페이지면 스크롤에 따라 변경
  return isScrolled.value
})

const handleScroll = () => {
  // 스크롤 300px 이후에 헤더 배경 활성화 (더 빠르게 배경 표시)
  isScrolled.value = window.scrollY > 300
}

const handleLogout = () => {
  authStore.logout()
  router.push('/signin')
}

const goHome = () => {
  router.push('/')
}

const toggleBrowseMenu = () => {
  showLanguageMenu.value = false
  showUserMenu.value = false
  showBrowseMenu.value = !showBrowseMenu.value
}

const closeBrowseMenu = () => {
  showBrowseMenu.value = false
}

const navigateTo = (path: string) => {
  router.push(path)
  closeBrowseMenu()
  closeUserMenu()
  closeLanguageMenu()
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (
    !target.closest('.browse-menu-container') &&
    !target.closest('.language-menu-container') &&
    !target.closest('.user-menu-container')
  ) {
    closeBrowseMenu()
    closeLanguageMenu()
    closeUserMenu()
  }
}

const toggleLanguageMenu = () => {
  showBrowseMenu.value = false
  showUserMenu.value = false
  showLanguageMenu.value = !showLanguageMenu.value
}

const closeLanguageMenu = () => {
  showLanguageMenu.value = false
}

const toggleUserMenu = () => {
  showBrowseMenu.value = false
  showLanguageMenu.value = false
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const changeLanguage = (newLocale: string) => {
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
  closeLanguageMenu()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="header" :class="{ scrolled: headerScrolled }">
    <div class="header-container">
      <div class="header-logo" @click="goHome">MOVIEFLIX</div>

      <div class="header-right">
        <nav class="header-nav">
          <!-- PC 버전 - 모든 메뉴 표시 -->
          <div class="header-nav-desktop">
            <RouterLink to="/" class="header-nav-link" :class="{ active: route.path === '/' }">
              <i class="fas fa-home"></i> {{ t('header.home') }}
            </RouterLink>
            <RouterLink
              to="/popular"
              class="header-nav-link"
              :class="{ active: route.path === '/popular' }"
            >
              <i class="fas fa-fire"></i> {{ t('header.popular') }}
            </RouterLink>
            <RouterLink
              to="/search"
              class="header-nav-link"
              :class="{ active: route.path === '/search' }"
            >
              <i class="fas fa-search"></i> {{ t('header.search') }}
            </RouterLink>
            <RouterLink
              to="/wishlist"
              class="header-nav-link"
              :class="{ active: route.path === '/wishlist' }"
            >
              <i class="fas fa-heart"></i> {{ t('wishlist.myList') }}
              <span v-if="wishlistCount > 0" class="wishlist-count">({{ wishlistCount }})</span>
            </RouterLink>
          </div>

          <!-- 모바일 버전 - 드롭다운 메뉴 -->
          <div class="header-nav-mobile">
            <div class="browse-menu-container">
              <button
                class="header-nav-link browse-toggle"
                :class="{ active: ['/', '/popular', '/search', '/wishlist'].includes(route.path) }"
                @click.stop="toggleBrowseMenu"
              >
                <i class="fas fa-th"></i> {{ t('header.browse') }}
                <i class="fas fa-chevron-down" :class="{ rotated: showBrowseMenu }"></i>
              </button>
              <Transition name="dropdown">
                <div v-if="showBrowseMenu" class="browse-dropdown">
                  <button
                    class="browse-dropdown-item"
                    :class="{ active: route.path === '/' }"
                    @click="navigateTo('/')"
                  >
                    <i class="fas fa-home"></i> {{ t('header.home') }}
                  </button>
                  <button
                    class="browse-dropdown-item"
                    :class="{ active: route.path === '/popular' }"
                    @click="navigateTo('/popular')"
                  >
                    <i class="fas fa-fire"></i> {{ t('header.popularContent') }}
                  </button>
                  <button
                    class="browse-dropdown-item"
                    :class="{ active: route.path === '/search' }"
                    @click="navigateTo('/search')"
                  >
                    <i class="fas fa-search"></i> {{ t('header.search') }}
                  </button>
                  <button
                    class="browse-dropdown-item"
                    :class="{ active: route.path === '/wishlist' }"
                    @click="navigateTo('/wishlist')"
                  >
                    <i class="fas fa-heart"></i> {{ t('wishlist.myWishlist') }}
                    <span v-if="wishlistCount > 0" class="wishlist-badge">{{
                      wishlistCount
                    }}</span>
                  </button>
                  <div class="dropdown-divider"></div>
                  <button class="browse-dropdown-item" @click="toggleTheme">
                    <i :class="isDark ? 'fas fa-moon' : 'fas fa-sun'"></i>
                    <span>{{ t('header.toggleTheme') }}</span>
                  </button>
                  <button class="browse-dropdown-item" @click="handleLogout">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>{{ t('header.signOut') }}</span>
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </nav>

        <button
          class="btn-icon theme-toggle hide-on-mobile"
          @click="toggleTheme"
          :title="t('header.toggleTheme')"
        >
          <i :class="isDark ? 'fas fa-moon' : 'fas fa-sun'"></i>
        </button>

        <div class="language-menu-container">
          <button class="btn-icon" @click.stop="toggleLanguageMenu" :title="t('header.language')">
            <i class="fas fa-globe" style="font-size: 1.1rem;"></i>
          </button>
          <Transition name="dropdown">
            <div v-if="showLanguageMenu" class="language-dropdown">
              <button
                class="language-dropdown-item"
                :class="{ active: locale === 'ko' }"
                @click="changeLanguage('ko')"
              >
                한국어
              </button>
              <button
                class="language-dropdown-item"
                :class="{ active: locale === 'en' }"
                @click="changeLanguage('en')"
              >
                English
              </button>
            </div>
          </Transition>
        </div>

        <!-- User Menu (Desktop) -->
        <div class="user-menu-container user-menu-desktop">
          <button class="user-menu-toggle" @click.stop="toggleUserMenu">
            <span class="header-user-name">{{ authStore.user }}</span>
            <i class="fas fa-chevron-down" :class="{ rotated: showUserMenu }"></i>
          </button>
          <Transition name="dropdown">
            <div v-if="showUserMenu" class="user-dropdown">
              <button class="user-dropdown-item" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>{{ t('header.signOut') }}</span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- Logout Button (Mobile Only is now removed) -->
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 오른쪽 영역을 묶어서 처리 */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.header-right .btn-icon,
.header-logout-mobile {
  color: var(--text-primary);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  border-radius: 4px;
  transition: all var(--transition-speed) var(--transition-ease);
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
}

/* Specific styles for light theme, unscrolled header (hero section) */
[data-theme='light'] .header:not(.scrolled) .header-right .btn-icon,
[data-theme='light'] .header:not(.scrolled) .header-logout-mobile {
  color: #ffffff; /* Make icon white */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8); /* Stronger shadow for contrast */
}

/* PC에서는 모든 메뉴 표시 */
.header-nav-desktop {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

/* 모바일에서는 드롭다운 메뉴 표시 */
.header-nav-mobile {
  display: none;
  gap: 0;
  align-items: center;
}

.browse-menu-container,
.language-menu-container,
.user-menu-container {
  position: relative;
}

.browse-toggle,
.user-menu-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  padding: 0.5rem 0.25rem;
  font-size: 1.1rem; /* Added font-size for browse toggle */
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  transition: all var(--transition-speed) var(--transition-ease);
  position: relative;
}

[data-theme='light'] .header:not(.scrolled) .browse-toggle,
[data-theme='light'] .header:not(.scrolled) .user-menu-toggle {
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.browse-toggle .fa-chevron-down,
.user-menu-toggle .fa-chevron-down {
  font-size: 0.75rem;
  transition: transform var(--transition-speed) var(--transition-ease);
}

.browse-toggle .fa-chevron-down.rotated,
.user-menu-toggle .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.browse-dropdown,
.language-dropdown,
.user-dropdown {
  position: absolute;
  top: calc(100% + 1rem);
  background-color: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  min-width: 120px;
  padding: 0.5rem 0;
  z-index: 1000;
}

.browse-dropdown,
.language-dropdown {
  left: 50%;
  transform: translateX(-50%);
}

.user-dropdown {
  right: 0;
  min-width: 180px;
}

[data-theme='light'] .browse-dropdown,
[data-theme='light'] .language-dropdown,
[data-theme='light'] .user-dropdown {
  background-color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
}

.browse-dropdown-item,
.language-dropdown-item,
.user-dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-speed) var(--transition-ease);
  text-align: left;
  position: relative;
}

.language-dropdown-item {
  justify-content: center;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0.5rem 0;
}

/* --- UNIFIED HOVER STYLES --- */
.browse-toggle:hover,
.user-menu-toggle:hover,
.header-right .btn-icon:hover,
.header-logout-mobile:hover,
.browse-dropdown-item:hover,
.language-dropdown-item:hover,
.user-dropdown-item:hover {
  color: var(--primary-color);
}

.browse-dropdown-item.active,
.language-dropdown-item.active {
  color: var(--primary-color);
  font-weight: 600;
}

.browse-dropdown-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background-color: var(--primary-color);
}

.browse-dropdown-item i {
  width: 20px;
  text-align: center;
}

.wishlist-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

[data-theme='light'] .header:not(.scrolled) .wishlist-count {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.wishlist-badge {
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  margin-left: 0.5rem;
  min-width: 20px;
  text-align: center;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s var(--transition-ease);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
}

.theme-toggle i {
  font-size: 1.1rem;
}

  .language-menu-container .btn-icon {
    padding: 0.3rem;
  }
/* Underline Animation */
.browse-toggle::after,
.user-menu-toggle::after,
.header-right .btn-icon::after,
.header-logout-mobile::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: width var(--transition-speed) var(--transition-ease);
  border-radius: 2px;
}

.browse-toggle:hover::after,
.user-menu-toggle:hover::after,
.header-right .btn-icon:hover::after,
.header-logout-mobile:hover::after {
  width: calc(100% - 1rem);
}

.header-logout-mobile {
  display: none;
}

@media (max-width: 768px) {
  .header {
    padding: 0.5rem 0;
  }

  .header-container {
    padding: 0 20px;
  }

  /* --- Mobile-specific reordering and hiding --- */
  .header-nav {
    order: 3;
  }
  .language-menu-container {
    order: 2;
  }
  .theme-toggle {
    order: 1;
  }
  .hide-on-mobile {
    display: none !important;
  }

  /* 태블릿부터 드롭다운 메뉴 표시 */
  .header-nav-desktop {
    display: none;
  }

  .header-nav-mobile {
    display: flex;
  }

  .header-right {
    gap: 0rem;
  }

  .header-logout-mobile i {
    font-size: 1.1rem; /* 모바일 로그아웃 아이콘 크기 증가 */
  }

  .browse-toggle {
    font-size: 1rem; /* Adjust browse toggle font size for mobile */
    padding: 0.5rem 0.5rem; /* Increase padding for better touch target */
  }

  .browse-dropdown {
    min-width: 180px;
    left: 50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    top: calc(100% + 0.5rem); /* Move closer to menu bar */
  }

  .language-dropdown {
    left: 50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    top: calc(100% + 0.5rem);
  }

  .user-dropdown {
    width: calc(100vw - 40px);
    max-width: 180px; /* Adjust max-width as needed for user dropdown */
    left: auto;
    right: 20px;
    transform: none;
    box-sizing: border-box;
    top: calc(100% + 0.5rem);
  }

  .browse-dropdown-item,
  .language-dropdown-item {
    padding: 0.75rem 0.5rem;
  }

  .browse-dropdown-item {
    font-size: 0.9rem;
  }

  .user-menu-desktop {
    display: none;
  }
}

.header-user-name {
  color: var(--text-primary);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

[data-theme='light'] .header:not(.scrolled) .header-user-name {
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}


@media (max-width: 480px) {
  .browse-dropdown {
    min-width: 160px;
  }

  .browse-dropdown-item {
    padding: 0.625rem 1rem;
    font-size: 0.85rem;
  }

  .header-right {
    gap: 0rem;
  }

  .user-menu-toggle .header-user-name {
    display: none;
  }

  .user-menu-toggle {
    padding: 0.4rem 0.6rem !important;
    font-size: 1.2rem !important;
  }

  .user-menu-toggle::after {
    content: '\f007'; /* user icon */
    font-family: 'Font Awesome 5 Free';
    font-weight: 900;
  }
}
</style>