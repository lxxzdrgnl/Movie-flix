<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { tryLogin, tryRegister, isValidEmail, setKeepLogin } from '@/utils/auth'
import ToastNotification from '@/components/ToastNotification.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null)

const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const rememberMe = ref(false)
const agreeTerms = ref(false)
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const showToast = (type: 'success' | 'error', title: string, message: string) => {
  toastRef.value?.addToast(type, title, message)
}

const validateEmail = () => {
  if (!email.value) {
    emailError.value = '이메일을 입력해주세요.'
    return false
  }
  if (!isValidEmail(email.value)) {
    emailError.value = '올바른 이메일 형식이 아닙니다.'
    return false
  }
  emailError.value = ''
  return true
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '비밀번호를 입력해주세요.'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = '비밀번호는 최소 6자 이상이어야 합니다.'
    return false
  }
  passwordError.value = ''
  return true
}

const validateConfirmPassword = () => {
  if (isSignUp.value) {
    if (!confirmPassword.value) {
      confirmPasswordError.value = '비밀번호 확인을 입력해주세요.'
      return false
    }
    if (password.value !== confirmPassword.value) {
      confirmPasswordError.value = '비밀번호가 일치하지 않습니다.'
      return false
    }
  }
  confirmPasswordError.value = ''
  return true
}

const handleLogin = () => {
  if (!validateEmail() || !validatePassword()) {
    return
  }

  tryLogin(
    email.value,
    password.value,
    (user) => {
      authStore.login(user.id)
      if (rememberMe.value) {
        setKeepLogin(true)
      }
      showToast('success', '로그인 성공', '환영합니다!')
      setTimeout(() => {
        router.push('/')
      }, 1000)
    },
    () => {
      showToast('error', '로그인 실패', '이메일 또는 비밀번호가 일치하지 않습니다.')
    }
  )
}

const handleSignUp = () => {
  if (!validateEmail() || !validatePassword() || !validateConfirmPassword()) {
    return
  }

  if (!agreeTerms.value) {
    showToast('error', '회원가입 실패', '약관에 동의해주세요.')
    return
  }

  tryRegister(
    email.value,
    password.value,
    () => {
      showToast('success', '회원가입 성공', '로그인 페이지로 이동합니다.')
      setTimeout(() => {
        isSignUp.value = false
        confirmPassword.value = ''
        agreeTerms.value = false
      }, 1000)
    },
    (message) => {
      showToast('error', '회원가입 실패', message)
    }
  )
}

const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  confirmPassword.value = ''
  agreeTerms.value = false
}

const handleSubmit = () => {
  if (isSignUp.value) {
    handleSignUp()
  } else {
    handleLogin()
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="auth-title">{{ isSignUp ? '회원가입' : '로그인' }}</h1>
        <p class="auth-subtitle">
          {{ isSignUp ? 'MOVIEFLIX에 가입하고 다양한 영화를 감상하세요' : 'MOVIEFLIX에 오신 것을 환영합니다' }}
        </p>
      </div>

      <Transition name="fade" mode="out-in">
        <form class="auth-form" @submit.prevent="handleSubmit" :key="isSignUp ? 'signup' : 'signin'">
          <div class="input-group">
            <label class="input-label" for="email">이메일</label>
            <input
              id="email"
              type="email"
              class="input-field"
              :class="{ 'input-error': emailError }"
              v-model="email"
              @blur="validateEmail"
              placeholder="example@email.com"
              required
            />
            <p v-if="emailError" class="error-message">{{ emailError }}</p>
          </div>

          <div class="input-group">
            <label class="input-label" for="password">비밀번호</label>
            <input
              id="password"
              type="password"
              class="input-field"
              :class="{ 'input-error': passwordError }"
              v-model="password"
              @blur="validatePassword"
              placeholder="비밀번호를 입력하세요"
              required
            />
            <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
          </div>

          <div v-if="isSignUp" class="input-group">
            <label class="input-label" for="confirmPassword">비밀번호 확인</label>
            <input
              id="confirmPassword"
              type="password"
              class="input-field"
              :class="{ 'input-error': confirmPasswordError }"
              v-model="confirmPassword"
              @blur="validateConfirmPassword"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            <p v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</p>
          </div>

          <div v-if="!isSignUp" class="checkbox-group">
            <input id="rememberMe" type="checkbox" class="checkbox-input" v-model="rememberMe" />
            <label for="rememberMe" class="checkbox-label">로그인 상태 유지</label>
          </div>

          <div v-if="isSignUp" class="checkbox-group">
            <input id="agreeTerms" type="checkbox" class="checkbox-input" v-model="agreeTerms" />
            <label for="agreeTerms" class="checkbox-label">
              서비스 이용약관 및 개인정보 처리방침에 동의합니다 (필수)
            </label>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-3">
            {{ isSignUp ? '회원가입' : '로그인' }}
          </button>
        </form>
      </Transition>

      <div class="auth-toggle">
        {{ isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?' }}
        <span class="auth-toggle-btn" @click="toggleMode">
          {{ isSignUp ? '로그인' : '회원가입' }}
        </span>
      </div>
    </div>

    <ToastNotification ref="toastRef" />
  </div>
</template>
