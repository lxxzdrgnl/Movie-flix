<script setup lang="ts">
import { ref, computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import MovieCard from '@/components/MovieCard.vue'
import MovieDetailModal from '@/components/MovieDetailModal.vue'
import type { Movie } from '@/types/movie'
import { useWishlist } from '@/composables/useWishlist'

const { wishlist } = useWishlist()

const hasMovies = computed(() => wishlist.value.length > 0)
const selectedMovie = ref<Movie | null>(null)
const showModal = ref(false)

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
</script>

<template>
  <div>
    <AppHeader />

    <main class="page-container">
      <div class="container">
        <div class="section-header">
          <h1 class="section-title">
            <i class="fas fa-heart" style="color: var(--primary-color)"></i> 내가 찜한 리스트
          </h1>
          <span v-if="hasMovies" class="text-secondary">총 {{ wishlist.length }}개의 영화</span>
        </div>

        <div v-if="hasMovies" class="movie-grid">
          <MovieCard v-for="movie in wishlist" :key="movie.id" :movie="movie" @click="handleMovieClick" />
        </div>

        <div v-else class="empty-state">
          <i class="fas fa-heart-broken empty-state-icon"></i>
          <h2 class="empty-state-title">찜한 영화가 없습니다</h2>
          <p class="empty-state-description">
            마음에 드는 영화를 찜해보세요!<br />
            영화 카드의 하트 아이콘을 클릭하면 이 목록에 추가됩니다.
          </p>
          <RouterLink to="/" class="btn btn-primary mt-4">
            <i class="fas fa-film"></i> 영화 둘러보기
          </RouterLink>
        </div>
      </div>
    </main>

    <MovieDetailModal :movie="selectedMovie" :show="showModal" @close="handleCloseModal" />
  </div>
</template>

<style scoped>
.text-secondary {
  color: var(--text-secondary);
  font-size: 0.95rem;
}
</style>
