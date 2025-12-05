import type { User } from '@/types/movie'

export const tryLogin = (
  email: string,
  password: string,
  success: (user: User) => void,
  fail: () => void
): void => {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]')
  const user = users.find((u) => u.id === email && u.password === password)

  if (user) {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('currentUser', email)
    success(user)
  } else {
    fail()
  }
}

export const tryRegister = (
  email: string,
  password: string,
  success: () => void,
  fail: (message: string) => void
): void => {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]')
  const userExists = users.some((user) => user.id === email)

  if (userExists) {
    fail('이미 존재하는 이메일입니다.')
    return
  }

  if (!isValidEmail(email)) {
    fail('올바른 이메일 형식이 아닙니다.')
    return
  }

  if (password.length < 6) {
    fail('비밀번호는 최소 6자 이상이어야 합니다.')
    return
  }

  users.push({ id: email, password })
  localStorage.setItem('users', JSON.stringify(users))
  success()
}

export const logout = (): void => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('currentUser')
  localStorage.removeItem('keepLogin')
}

export const isLoggedIn = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true'
}

export const getCurrentUser = (): string | null => {
  return localStorage.getItem('currentUser')
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const setKeepLogin = (keep: boolean): void => {
  if (keep) {
    localStorage.setItem('keepLogin', 'true')
  } else {
    localStorage.removeItem('keepLogin')
  }
}

export const shouldKeepLogin = (): boolean => {
  return localStorage.getItem('keepLogin') === 'true'
}
