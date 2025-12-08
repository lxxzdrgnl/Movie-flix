<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import MovieCard from '@/components/MovieCard.vue'
import MovieCardSkeleton from '@/components/MovieCardSkeleton.vue'
import MovieDetailModal from '@/components/MovieDetailModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { Movie } from '@/types/movie'
import { getPopularMovies } from '@/utils/tmdb'

const movies = ref<Movie[]>([])
const loading = ref(false)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const viewMode = ref<'table' | 'infinite'>('infinite')
const showScrollTop = ref(false)
const selectedMovie = ref<Movie | null>(null)
const showModal = ref(false)

const loadMovies = async (page: number, append: boolean = false) => {
  try {
    if (append) {
      isLoadingMore.value = true
    } else {
      loading.value = true
    }

    const response = await getPopularMovies(page)

    if (append) {
      movies.value = [...movies.value, ...response.results]
    } else {
      movies.value = response.results
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    totalPages.value = response.total_pages
    currentPage.value = page
  } catch (err) {
    console.error('영화 데이터 로드 실패:', err)
  } finally {
    loading.value = false
    isLoadingMore.value = false
  }
}

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300

  if (viewMode.value === 'infinite' && !loading.value && !isLoadingMore.value) {
    const scrollBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500

    if (scrollBottom && currentPage.value < totalPages.value) {
      loadMovies(currentPage.value + 1, true)
    }
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    loadMovies(page)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

const switchViewMode = (mode: 'table' | 'infinite') => {
  viewMode.value = mode
  if (mode === 'table') {
    loadMovies(1)
  } else {
    loadMovies(1)
  }
}

const handleMovieClick = (movie: Movie) => {
  selectedMovie.value = movie
  showModal.value = true
}

const handleCloseModal = () => {
  showModal.value = false
  setTimeout(() => {
    selectedMovie.value = null
  }, 300)
}

onMounted(() => {
  loadMovies(1)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div>
    <AppHeader />

    <main class="page-container">
      <div class="container">
        <div class="section-header">
          <h1 class="section-title">
            <i class="fas fa-fire" style="color: var(--primary-color)"></i> 대세 콘텐츠
          </h1>

          <div class="view-controls">
            <div class="view-toggle">
              <button
                class="view-toggle-btn"
                :class="{ active: viewMode === 'table' }"
                @click="switchViewMode('table')"
              >
                <i class="fas fa-th"></i> Table
              </button>
              <button
                class="view-toggle-btn"
                :class="{ active: viewMode === 'infinite' }"
                @click="switchViewMode('infinite')"
              >
                <i class="fas fa-stream"></i> Infinite
              </button>
            </div>
          </div>
        </div>

        <div v-if="viewMode === 'table'" class="table-view">
          <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" @click="handleMovieClick" />
        </div>

        <div v-else class="movie-grid">
          <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" @click="handleMovieClick" />
          <MovieCardSkeleton v-if="isLoadingMore" v-for="i in 6" :key="'skeleton-' + i" />
        </div>

        <LoadingSpinner v-if="loading" text="영화 목록을 불러오는 중..." />

        <div v-if="viewMode === 'table'" class="pagination">
          <button class="pagination-btn" @click="previousPage" :disabled="currentPage === 1">
            <i class="fas fa-chevron-left"></i> 이전
          </button>

          <span class="pagination-info">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button class="pagination-btn" @click="nextPage" :disabled="currentPage >= totalPages">
            다음 <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <button
          v-if="viewMode === 'infinite'"
          class="scroll-top-btn"
          :class="{ visible: showScrollTop }"
          @click="scrollToTop"
        >
          <i class="fas fa-arrow-up"></i>
        </button>
      </div>
    </main>

    <MovieDetailModal :movie="selectedMovie" :show="showModal" @close="handleCloseModal" />
  </div>
</template>
