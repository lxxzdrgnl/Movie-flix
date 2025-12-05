# Claude AI 활용 가이드 - 과제 참고 문서

## 프로젝트 개요
Netflix와 유사한 영화 데모 사이트 제작
- Framework: Vue.js 3 + TypeScript
- 라우팅: Vue Router
- 상태 관리: Pinia
- API: The Movie Database (TMDB)
- 스타일: CSS3 (Transition & Animation)
- 배포: GitHub Pages

---

## 1. Authentication.js 참고 사항

### 주요 기능
사용자 인증 관련 유틸리티 함수들을 포함

### 로그인 처리 (tryLogin)
```javascript
tryLogin(email, password, success, fail, saveToken) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(user => user.id === email && user.password === password);

  if (user) {
    localStorage.setItem('TMDb-Key', user.password); // API 키 저장
    success(user);
  } else {
    fail();
  }
}
```

**핵심 포인트:**
- 사용자 정보는 localStorage에 저장
- password는 TMDB API Key로 사용
- 로그인 성공 시 'TMDb-Key'를 localStorage에 저장

### 회원가입 처리 (tryRegister)
```javascript
tryRegister(email, password, success, fail) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userExists = users.some(existingUser => existingUser.id === email);

  if (!userExists) {
    users.push({ id: email, password: password });
    localStorage.setItem('users', JSON.stringify(users));
    success();
  } else {
    fail();
  }
}
```

**핵심 포인트:**
- 이메일 중복 체크
- 사용자 배열에 추가 후 localStorage에 저장
- password는 TMDB API Key

---

## 2. URL.ts 참고 사항

### API 엔드포인트 구성
```typescript
const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'your-api-key';
const LANGUAGE = 'ko-KR';

// 공통 매개변수
const commonParams = `api_key=${API_KEY}&language=${LANGUAGE}&page=${page}`;

// 주요 엔드포인트
const endpoints = {
  popular: `/movie/popular?${commonParams}`,
  nowPlaying: `/movie/now_playing?${commonParams}`,
  topRated: `/movie/top_rated?${commonParams}`,
  upcoming: `/movie/upcoming?${commonParams}`,
  discover: `/discover/movie?${commonParams}`,
  search: `/search/movie?${commonParams}&query=${query}`,
};
```

### 데이터 요청 처리
```typescript
const fetchMovies = async (url: string): Promise<MovieResponse> => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
};
```

**핵심 포인트:**
- axios를 사용한 HTTP 요청
- 한국어(ko-KR) 응답 설정
- 페이지네이션 지원
- 에러 핸들링

### TMDB API 주요 엔드포인트
1. **인기 영화**: `/movie/popular`
2. **현재 상영작**: `/movie/now_playing`
3. **높은 평점**: `/movie/top_rated`
4. **개봉 예정**: `/movie/upcoming`
5. **장르별 필터링**: `/discover/movie`
6. **검색**: `/search/movie`

---

## 3. useWishlist.ts 참고 사항

### 데이터 구조
```typescript
interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
}
```

### Wishlist 관리 클래스
```typescript
class WishlistManager {
  private wishlist: Movie[] = [];

  constructor() {
    this.loadWishlist();
  }

  // 로컬 스토리지에서 위시리스트 로드
  private loadWishlist(): void {
    const stored = localStorage.getItem('movieWishlist');
    this.wishlist = stored ? JSON.parse(stored) : [];
  }

  // 로컬 스토리지에 저장
  private saveWishlist(): void {
    localStorage.setItem('movieWishlist', JSON.stringify(this.wishlist));
  }

  // 위시리스트 토글 (추가/제거)
  toggleWishlist(movie: Movie): void {
    const index = this.wishlist.findIndex(item => item.id === movie.id);

    if (index === -1) {
      this.wishlist.push(movie);
    } else {
      this.wishlist.splice(index, 1);
    }

    this.saveWishlist();
  }

  // 위시리스트에 있는지 확인
  isInWishlist(movieId: number): boolean {
    return this.wishlist.some(item => item.id === movieId);
  }

  // 전체 위시리스트 반환
  getWishlist(): Movie[] {
    return this.wishlist;
  }
}
```

**핵심 포인트:**
- localStorage를 사용한 영구 저장
- JSON 직렬화/역직렬화
- 토글 방식으로 추가/제거
- 위시리스트 상태 확인 기능

---

## 4. 공통 특징 및 베스트 프랙티스

### 데이터 관리
- 모든 사용자 데이터는 localStorage에 저장
- JSON 형식으로 직렬화하여 저장
- 키 네이밍 규칙 준수: 'TMDb-Key', 'users', 'movieWishlist'

### API 통신
- TMDB API 사용
- 한국어(ko-KR) 응답 기본 설정
- 페이지네이션 지원
- 에러 핸들링 필수

### 타입 안정성
- TypeScript 인터페이스 활용
- 명시적 타입 선언
- 타입 가드를 통한 안전성 확보

### Local Storage 키 목록
1. **TMDb-Key**: TMDB API 키 (로그인 시 저장)
2. **users**: 회원가입한 사용자 목록
3. **movieWishlist**: 사용자가 찜한 영화 목록
4. **keepLogin**: 로그인 유지 여부 (Remember me)
5. **currentUser**: 현재 로그인한 사용자 정보

---

## 5. Vue.js 구현 가이드

### Composition API 사용
```typescript
import { ref, computed, onMounted } from 'vue';

export function useMovies() {
  const movies = ref<Movie[]>([]);
  const loading = ref(false);

  const fetchMovies = async () => {
    loading.value = true;
    try {
      // API 호출
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchMovies();
  });

  return {
    movies,
    loading,
    fetchMovies,
  };
}
```

### Pinia Store 사용 (전역 상태 관리)
```typescript
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    apiKey: '',
  }),

  actions: {
    login(email: string, apiKey: string) {
      this.user = email;
      this.isLoggedIn = true;
      this.apiKey = apiKey;
    },

    logout() {
      this.user = null;
      this.isLoggedIn = false;
      this.apiKey = '';
    },
  },
});
```

---

## 6. CSS Animation 구현 가이드

### 기본 Transition
```css
.movie-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}
```

### 로그인-회원가입 전환 효과
```css
.auth-container {
  position: relative;
  perspective: 1000px;
}

.auth-form {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.auth-form.flip {
  transform: rotateY(180deg);
}
```

### Loading Animation
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading {
  animation: spin 1s linear infinite;
}
```

---

## 7. Router 가드 구현

```typescript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/signin',
      component: SignIn,
    },
    {
      path: '/',
      component: Home,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('TMDb-Key');

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/signin');
  } else if (to.path === '/signin' && isLoggedIn) {
    next('/');
  } else {
    next();
  }
});
```

---

## 8. 페이지별 구현 체크리스트

### 로그인/회원가입 페이지 (/signin)
- [ ] 이메일 형식 검증
- [ ] 비밀번호 확인 (회원가입 시)
- [ ] Remember me 기능
- [ ] 약관 동의 체크박스
- [ ] 로그인/회원가입 전환 애니메이션
- [ ] Toast 메시지 표시
- [ ] Local Storage 저장

### 메인 페이지 (/)
- [ ] 최소 4개 이상의 TMDB API 사용
- [ ] 영화 포스터, 제목, 설명 표시
- [ ] 호버 시 확대 효과
- [ ] 찜하기 기능
- [ ] Loading 상태 표시

### 대세 콘텐츠 페이지 (/popular)
- [ ] Table View / Infinity Scroll 토글
- [ ] Pagination (Table View)
- [ ] 무한 스크롤 (Infinity Scroll)
- [ ] Top 버튼
- [ ] Loading 효과

### 찾아보기 페이지 (/search)
- [ ] 장르별 필터링
- [ ] 평점별 필터링
- [ ] 정렬 기능
- [ ] 필터 초기화 버튼

### 내가 찜한 리스트 (/wishlist)
- [ ] Local Storage에서 데이터 로드
- [ ] API 호출 없이 구현
- [ ] 찜 제거 기능

---

## 9. 반응형 웹 구현

### 미디어 쿼리
```css
/* Mobile */
@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .movie-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .movie-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

---

## 10. Git Flow 전략

### 브랜치 구조
- **main**: 프로덕션 배포 브랜치
- **develop**: 개발 통합 브랜치
- **feature/기능명**: 기능 개발 브랜치

### 커밋 메시지 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 업무 수정
```

---

## 참고 자료
- TMDB API 문서: https://developers.themoviedb.org/3
- Vue.js 공식 문서: https://vuejs.org/
- Pinia 공식 문서: https://pinia.vuejs.org/
- Vue Router 공식 문서: https://router.vuejs.org/
