<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import LargeMovieCard from '@/components/LargeMovieCard.vue'
import MovieSlider from '@/components/MovieSlider.vue'
import MovieDetailModal from '@/components/MovieDetailModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { Movie } from '@/types/movie'
import {
  getTrendingMovies,
  getPopularTvShows,
  getNowPlayingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  discoverMovies,
  discoverTvShows
} from '@/utils/tmdb'
import { getBackdropUrl } from '@/utils/tmdb'

const { t, locale } = useI18n()

const dailyTrendingMovies = ref<Movie[]>([])
const popularTvShows = ref<Movie[]>([])
const nowPlayingMovies = ref<Movie[]>([])
const topRatedMovies = ref<Movie[]>([])
const upcomingMovies = ref<Movie[]>([])
const actionMovies = ref<Movie[]>([])
const comedyMovies = ref<Movie[]>([])
const romanceMovies = ref<Movie[]>([])
const sciFiMovies = ref<Movie[]>([])
const horrorMovies = ref<Movie[]>([])
const animationMovies = ref<Movie[]>([])
const documentaryMovies = ref<Movie[]>([])
const koreanMovies = ref<Movie[]>([])
const koreanTvShows = ref<Movie[]>([])

const loading = ref(true)
const error = ref<string | null>(null)
const selectedMovie = ref<Movie | null>(null)
const showModal = ref(false)
const heroMovie = ref<Movie | null>(null)
let heroInterval: number | null = null

const allMovies = computed(() => [
  ...dailyTrendingMovies.value,
  ...nowPlayingMovies.value,
  ...upcomingMovies.value,
  ...koreanMovies.value
])

const selectRandomHeroMovie = () => {
  if (allMovies.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * allMovies.value.length)
    heroMovie.value = allMovies.value[randomIndex] ?? null
  }
}

const startHeroRotation = () => {
  selectRandomHeroMovie()
  heroInterval = window.setInterval(() => {
    selectRandomHeroMovie()
  }, 4000)
}

const stopHeroRotation = () => {
  if (heroInterval) {
    clearInterval(heroInterval)
    heroInterval = null
  }
}

const mapTvShowToMovie = (tvShow: any): Movie => ({
  ...tvShow,
  title: tvShow.name,
  release_date: tvShow.first_air_date
})

const loadMovies = async () => {
  try {
    loading.value = true
    const [
      dailyTrending,
      popularTv,
      nowPlaying,
      topRated,
      upcoming,
      action,
      comedy,
      romance,
      sciFi,
      horror,
      animation,
      documentary,
      korean,
      koreanTv
    ] = await Promise.all([
      getTrendingMovies('day'),
      getPopularTvShows(),
      getNowPlayingMovies(),
      getTopRatedMovies(),
      getUpcomingMovies(),
      discoverMovies({ with_genres: '28' }),
      discoverMovies({ with_genres: '35' }),
      discoverMovies({ with_genres: '10749' }),
      discoverMovies({ with_genres: '878' }),
      discoverMovies({ with_genres: '27' }),
      discoverMovies({ with_genres: '16' }),
      discoverMovies({ with_genres: '99' }),
      discoverMovies({ with_origin_country: 'KR', sort_by: 'popularity.desc' }),
      discoverTvShows({ with_origin_country: 'KR', sort_by: 'popularity.desc' })
    ])

    dailyTrendingMovies.value = dailyTrending.results
    popularTvShows.value = popularTv.results.map(mapTvShowToMovie)
    nowPlayingMovies.value = nowPlaying.results
    topRatedMovies.value = topRated.results
    upcomingMovies.value = upcoming.results
    actionMovies.value = action.results
    comedyMovies.value = comedy.results
    romanceMovies.value = romance.results
    sciFiMovies.value = sciFi.results
    horrorMovies.value = horror.results
    animationMovies.value = animation.results
    documentaryMovies.value = documentary.results
    koreanMovies.value = korean.results
    koreanTvShows.value = koreanTv.results.map(mapTvShowToMovie)

    startHeroRotation()
  } catch (err) {
    error.value = t('home.error.invalidKey')
    console.error('영화 데이터 로드 실패:', err)
  } finally {
    loading.value = false
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

watch(locale, () => {
  loadMovies()
})

onMounted(() => {
  loadMovies()
})

onUnmounted(() => {
  stopHeroRotation()
})
</script>

<template>
  <div>
    <AppHeader />

    <!-- Hero Banner -->
    <Transition name="hero-fade" mode="out-in">
      <div v-if="heroMovie && !loading" :key="heroMovie.id" class="hero-banner">
        <img
          :src="getBackdropUrl(heroMovie.backdrop_path)"
          :alt="heroMovie.title"
          class="hero-banner-bg"
        />
        <div class="hero-banner-overlay"></div>
        <div class="hero-banner-content">
          <h1 class="hero-banner-title">{{ heroMovie.title }}</h1>
          <div class="hero-banner-meta">
            <span class="hero-banner-rating">
              <i class="fas fa-star"></i>
              {{ heroMovie.vote_average.toFixed(1) }}
            </span>
            <span class="hero-banner-year">
              {{ heroMovie.release_date?.split('-')[0] || 'N/A' }}
            </span>
          </div>
          <p class="hero-banner-description">
            {{ heroMovie.overview || t('home.hero.overviewPlaceholder') }}
          </p>
          <div class="hero-banner-actions">
            <button class="btn btn-primary" @click="handleMovieClick(heroMovie)">
              <i class="fas fa-play"></i> {{ t('home.hero.details') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <main class="page-container">
      <div class="container">
        <LoadingSpinner v-if="loading" :text="t('home.loading')" />

        <div v-else-if="error" class="empty-state">
          <i class="fas fa-exclamation-triangle empty-state-icon"></i>
          <h2 class="empty-state-title">{{ t('home.error.title') }}</h2>
          <p class="empty-state-description">{{ error }}</p>
        </div>

        <div v-else>
          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.dailyTrend') }}</h2>
            </div>
            <MovieSlider :movies="dailyTrendingMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.popularTv') }}</h2>
            </div>
            <MovieSlider :movies="popularTvShows">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.nowPlaying') }}</h2>
            </div>
            <MovieSlider :movies="nowPlayingMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.upcoming') }}</h2>
            </div>
            <MovieSlider :movies="upcomingMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.topRated') }}</h2>
            </div>
            <MovieSlider :movies="topRatedMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.koreanPopularMovies') }}</h2>
            </div>
            <MovieSlider :movies="koreanMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.koreanPopularTv') }}</h2>
            </div>
            <MovieSlider :movies="koreanTvShows">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.action') }}</h2>
            </div>
            <MovieSlider :movies="actionMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.comedy') }}</h2>
            </div>
            <MovieSlider :movies="comedyMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.romance') }}</h2>
            </div>
            <MovieSlider :movies="romanceMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.sf') }}</h2>
            </div>
            <MovieSlider :movies="sciFiMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.horror') }}</h2>
            </div>
            <MovieSlider :movies="horrorMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.animation') }}</h2>
            </div>
            <MovieSlider :movies="animationMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>

          <section class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('home.sections.documentary') }}</h2>
            </div>
            <MovieSlider :movies="documentaryMovies">
              <template #default="{ movie }">
                <LargeMovieCard :movie="movie" @click="handleMovieClick" />
              </template>
            </MovieSlider>
          </section>
        </div>
      </div>
    </main>

    <AppFooter />

    <MovieDetailModal :movie="selectedMovie" :show="showModal" @close="handleCloseModal" />
  </div>
</template>

<style scoped>
/* Override page-container padding for hero */
.page-container {
  padding-top: 0;
}

.hero-banner {
  position: relative;
  height: 90vh;
  min-height: 650px;
  max-height: 850px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.hero-banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    transparent 40%,
    transparent 70%,
    #141414 100%
  );
}

[data-theme='light'] .hero-banner-overlay {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    transparent 40%,
    transparent 70%,
    #f5f5f5 100%
  );
}

/* Section Styles */
.section {
  margin-bottom: 1rem;
}

.section-header {
  margin-bottom: 0.25rem;
}

/* Movies Slider */
.movies-slider {
  padding: 0.5rem 0 1rem;
}

/* Specific fix for title-slider spacing */
.section-header h2.section-title {
  margin-bottom: 0; /* Reset default h2 margin */
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-banner {
    height: 45vh;
    min-height: 350px;
    max-height: 450px;
  }

  .hero-banner-content {
    padding: 0 1rem;
    padding-bottom: 2rem;
  }

  .hero-banner-title {
    font-size: 2rem;
  }

  .hero-banner-meta {
    font-size: 0.95rem;
    gap: 1rem;
  }

  .hero-banner-description {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
    -webkit-line-clamp: 2;
  }

  .hero-banner-actions .btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .hero-banner {
    height: 55vh;
    min-height: 300px;
  }

  .hero-banner-title {
    font-size: 1.5rem;
  }

  .hero-banner-meta {
    font-size: 0.85rem;
  }

  .hero-banner-description {
    font-size: 0.85rem;
  }

  .hero-banner-actions {
    flex-direction: column;
  }

  .hero-banner-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
