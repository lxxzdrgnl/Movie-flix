<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import MovieCard from '@/components/MovieCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { Movie, Genre } from '@/types/movie'
import { discoverMovies, getGenres } from '@/utils/tmdb'

const movies = ref<Movie[]>([])
const genres = ref<Genre[]>([])
const loading = ref(false)
const selectedGenre = ref<string>('')
const selectedRating = ref<string>('')
const sortBy = ref<string>('popularity.desc')

const loadGenres = async () => {
  try {
    genres.value = await getGenres()
  } catch (err) {
    console.error('장르 목록 로드 실패:', err)
  }
}

const searchMovies = async () => {
  try {
    loading.value = true
    const params: Record<string, string | number> = {
      sort_by: sortBy.value,
      page: 1,
    }

    if (selectedGenre.value) {
      params.with_genres = selectedGenre.value
    }

    if (selectedRating.value) {
      params['vote_average.gte'] = selectedRating.value
    }

    const response = await discoverMovies(params)
    movies.value = response.results
  } catch (err) {
    console.error('영화 검색 실패:', err)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  selectedGenre.value = ''
  selectedRating.value = ''
  sortBy.value = 'popularity.desc'
  searchMovies()
}

onMounted(() => {
  loadGenres()
  searchMovies()
})
</script>

<template>
  <div>
    <AppHeader />

    <main class="page-container">
      <div class="container">
        <h1 class="section-title">
          <i class="fas fa-search" style="color: var(--primary-color)"></i> 찾아보기
        </h1>

        <div class="filter-section">
          <div class="filter-header">
            <h3 class="filter-title">필터</h3>
            <button class="btn btn-secondary filter-reset" @click="resetFilters">
              <i class="fas fa-redo"></i> 초기화
            </button>
          </div>

          <div class="filter-grid">
            <div class="filter-group">
              <label class="filter-label" for="genre">장르</label>
              <select
                id="genre"
                class="filter-select"
                v-model="selectedGenre"
                @change="searchMovies"
              >
                <option value="">전체</option>
                <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                  {{ genre.name }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label" for="rating">최소 평점</label>
              <select
                id="rating"
                class="filter-select"
                v-model="selectedRating"
                @change="searchMovies"
              >
                <option value="">전체</option>
                <option value="9">9.0 이상</option>
                <option value="8">8.0 이상</option>
                <option value="7">7.0 이상</option>
                <option value="6">6.0 이상</option>
                <option value="5">5.0 이상</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label" for="sort">정렬</label>
              <select id="sort" class="filter-select" v-model="sortBy" @change="searchMovies">
                <option value="popularity.desc">인기순 (높은순)</option>
                <option value="popularity.asc">인기순 (낮은순)</option>
                <option value="vote_average.desc">평점순 (높은순)</option>
                <option value="vote_average.asc">평점순 (낮은순)</option>
                <option value="release_date.desc">개봉일 (최신순)</option>
                <option value="release_date.asc">개봉일 (오래된순)</option>
                <option value="title.asc">제목 (가나다순)</option>
              </select>
            </div>
          </div>
        </div>

        <LoadingSpinner v-if="loading" text="영화를 검색하는 중..." />

        <div v-else-if="movies.length === 0" class="empty-state">
          <i class="fas fa-search empty-state-icon"></i>
          <h2 class="empty-state-title">검색 결과가 없습니다</h2>
          <p class="empty-state-description">다른 필터를 선택해보세요</p>
        </div>

        <div v-else class="movie-grid">
          <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
        </div>
      </div>
    </main>
  </div>
</template>
