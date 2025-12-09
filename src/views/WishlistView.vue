<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import AppHeader from '@/components/AppHeader.vue'
import MovieCard from '@/components/MovieCard.vue'
import MovieDetailModal from '@/components/MovieDetailModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { Movie } from '@/types/movie'
import { useWishlist } from '@/composables/useWishlist'
import { useRecommendations } from '@/composables/useRecommendations'

const { wishlist } = useWishlist()
const { recommendations, loading: recommendationsLoading, getRecommendationsFromWishlist } = useRecommendations()

const hasMovies = computed(() => wishlist.value.length > 0)
const hasRecommendations = computed(() => recommendations.value.length > 0)
const selectedMovie = ref<Movie | null>(null)
const showModal = ref(false)

const modules = [Navigation, Autoplay]

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

// 찜 목록이 변경될 때마다 추천 영화 로드
watch(wishlist, (newWishlist) => {
  if (newWishlist.length > 0) {
    getRecommendationsFromWishlist(newWishlist)
  }
}, { immediate: true })
</script>

<template>
  <div>
    <AppHeader />

    <main class="page-container">
      <div class="container">
        <div class="section-header">
          <h1 class="section-title">
            내가 찜한 리스트
          </h1>
          <span v-if="hasMovies" class="text-secondary">총 {{ wishlist.length }}개의 영화</span>
        </div>

        <div v-if="hasMovies">
          <div class="movie-grid">
            <MovieCard v-for="movie in wishlist" :key="movie.id" :movie="movie" @click="handleMovieClick" />
          </div>

          <!-- 추천 섹션 -->
          <section v-if="hasRecommendations || recommendationsLoading" class="recommendations-section">
            <div class="section-header">
              <h2 class="section-title">
                내 취향 저격 영화
              </h2>
              <p class="text-secondary">찜한 영화를 바탕으로 추천해드려요</p>
            </div>

            <LoadingSpinner v-if="recommendationsLoading" text="추천 영화를 찾고 있습니다..." />

            <Swiper
              v-else-if="hasRecommendations"
              :modules="modules"
              :slides-per-view="2"
              :space-between="10"
              :navigation="true"
              :autoplay="{ delay: 4000, disableOnInteraction: false }"
              :breakpoints="{
                480: { slidesPerView: 2, spaceBetween: 15 },
                640: { slidesPerView: 3, spaceBetween: 15 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
                1280: { slidesPerView: 5, spaceBetween: 20 }
              }"
              class="recommendations-slider"
            >
              <SwiperSlide v-for="movie in recommendations" :key="movie.id">
                <MovieCard :movie="movie" @click="handleMovieClick" />
              </SwiperSlide>
            </Swiper>
          </section>
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

.section-header h1.section-title {
  margin-bottom: 0.25rem;
}

.recommendations-section {
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid var(--border-color);
}

.recommendations-section .section-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.recommendations-section .section-header h2.section-title {
  margin-bottom: 0;
}

.recommendations-slider {
  padding: 1rem 0 1.5rem;
}

/* Swiper Custom Styles */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: var(--primary-color);
  background: rgba(0, 0, 0, 0.5);
  width: 45px;
  height: 45px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background: var(--primary-color);
  color: white;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .recommendations-section {
    margin-top: 3rem;
    padding-top: 2rem;
  }

  .recommendations-section .section-title {
    font-size: 1.4rem;
  }

  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    width: 35px;
    height: 35px;
  }

  :deep(.swiper-button-next::after),
  :deep(.swiper-button-prev::after) {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .recommendations-section .section-title {
    font-size: 1.2rem;
  }
}
</style>
