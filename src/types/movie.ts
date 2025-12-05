export interface Movie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  vote_average: number
  release_date: string
  genre_ids?: number[]
  popularity?: number
  vote_count?: number
  adult?: boolean
  original_language?: string
  original_title?: string
  video?: boolean
}

export interface MovieResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface Genre {
  id: number
  name: string
}

export interface User {
  id: string
  password: string
}
