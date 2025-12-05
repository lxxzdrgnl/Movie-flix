import { ref, computed } from 'vue'
import type { Movie } from '@/types/movie'

const wishlist = ref<Movie[]>([])

const loadWishlist = (): void => {
  const stored = localStorage.getItem('movieWishlist')
  wishlist.value = stored ? JSON.parse(stored) : []
}

const saveWishlist = (): void => {
  localStorage.setItem('movieWishlist', JSON.stringify(wishlist.value))
}

export const useWishlist = () => {
  const toggleWishlist = (movie: Movie): void => {
    const index = wishlist.value.findIndex((item) => item.id === movie.id)

    if (index === -1) {
      wishlist.value.push(movie)
    } else {
      wishlist.value.splice(index, 1)
    }

    saveWishlist()
  }

  const isInWishlist = (movieId: number): boolean => {
    return wishlist.value.some((item) => item.id === movieId)
  }

  const getWishlist = (): Movie[] => {
    return wishlist.value
  }

  const removeFromWishlist = (movieId: number): void => {
    const index = wishlist.value.findIndex((item) => item.id === movieId)
    if (index !== -1) {
      wishlist.value.splice(index, 1)
      saveWishlist()
    }
  }

  const wishlistCount = computed(() => wishlist.value.length)

  // 초기 로드
  if (wishlist.value.length === 0) {
    loadWishlist()
  }

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
    getWishlist,
    removeFromWishlist,
    wishlistCount,
  }
}
