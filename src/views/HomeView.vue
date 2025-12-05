<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import MovieCard from '@/components/MovieCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { Movie } from '@/types/movie'
import {
  getPopularMovies,
  getNowPlayingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
} from '@/utils/tmdb'

const popularMovies = ref<Movie[]>([])
const nowPlayingMovies = ref<Movie[]>([])
const topRatedMovies = ref<Movie[]>([])
const upcomingMovies = ref<Movie[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const loadMovies = async () => {
  try {
    loading.value = true
    const [popular, nowPlaying, topRated, upcoming] = await Promise.all([
      getPopularMovies(),
      getNowPlayingMovies(),
      getTopRatedMovies(),
      getUpcomingMovies(),
    ])

    popularMovies.value = popular.results.slice(0, 10)
    nowPlayingMovies.value = nowPlaying.results.slice(0, 10)
    topRatedMovies.value = topRated.results.slice(0, 10)
    upcomingMovies.value = upcoming.results.slice(0, 10)
  } catch (err) {
    error.value = 'API 키가 유효하지 않습니다. 로그아웃 후 올바른 TMDB API 키로 다시 로그인해주세요.'
    console.error('영화 데이터 로드 실패:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMovies()
})
</script>

<template>
  <div>
    <AppHeader />

    <main class="page-container">
      <div class="container">
        <LoadingSpinner v-if="loading" text="영화 목록을 불러오는 중..." />

        <div v-else-if="error" class="empty-state">
          <i class="fas fa-exclamation-triangle empty-state-icon"></i>
          <h2 class="empty-state-title">오류가 발생했습니다</h2>
          <p class="empty-state-description">{{ error }}</p>
        </div>

        <div v-else>
          <section class="section">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-fire" style="color: var(--primary-color)"></i> 인기 영화
              </h2>
            </div>
            <div class="movie-grid">
              <MovieCard v-for="movie in popularMovies" :key="movie.id" :movie="movie" />
            </div>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-play-circle" style="color: var(--primary-color)"></i> 현재 상영작
              </h2>
            </div>
            <div class="movie-grid">
              <MovieCard v-for="movie in nowPlayingMovies" :key="movie.id" :movie="movie" />
            </div>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-star" style="color: #ffd700"></i> 높은 평점
              </h2>
            </div>
            <div class="movie-grid">
              <MovieCard v-for="movie in topRatedMovies" :key="movie.id" :movie="movie" />
            </div>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-calendar-alt" style="color: var(--primary-color)"></i> 개봉 예정
              </h2>
            </div>
            <div class="movie-grid">
              <MovieCard v-for="movie in upcomingMovies" :key="movie.id" :movie="movie" />
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>
