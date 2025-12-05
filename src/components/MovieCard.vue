<script setup lang="ts">
import { computed } from 'vue'
import type { Movie } from '@/types/movie'
import { getPosterUrl } from '@/utils/tmdb'
import { useWishlist } from '@/composables/useWishlist'

interface Props {
  movie: Movie
}

const props = defineProps<Props>()
const { toggleWishlist, isInWishlist } = useWishlist()

const posterUrl = computed(() => getPosterUrl(props.movie.poster_path))
const rating = computed(() => props.movie.vote_average.toFixed(1))
const releaseYear = computed(() => props.movie.release_date?.split('-')[0] || 'N/A')
const isWishlisted = computed(() => isInWishlist(props.movie.id))

const handleWishlistToggle = (e: Event) => {
  e.stopPropagation()
  toggleWishlist(props.movie)
}
</script>

<template>
  <div class="movie-card">
    <img :src="posterUrl" :alt="movie.title" class="movie-card-poster" loading="lazy" />

    <button
      class="movie-card-wishlist"
      :class="{ active: isWishlisted }"
      @click="handleWishlistToggle"
      :aria-label="isWishlisted ? '찜 취소' : '찜하기'"
    >
      <i :class="isWishlisted ? 'fas fa-heart' : 'far fa-heart'"></i>
    </button>

    <div class="movie-card-overlay">
      <h3 class="movie-card-title">{{ movie.title }}</h3>
      <div class="movie-card-info">
        <span class="movie-card-rating">
          <i class="fas fa-star" style="color: #ffd700"></i>
          {{ rating }}
        </span>
        <span>{{ releaseYear }}</span>
      </div>
      <p class="movie-card-overview">
        {{ movie.overview || '설명이 없습니다.' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.movie-card-overview {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
