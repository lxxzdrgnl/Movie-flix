import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import ko from '@/locales/ko.json'

const getBrowserLocale = () => {
  const browserLang = navigator.language || (navigator as any).userLanguage
  return browserLang.split('-')[0]
}

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: localStorage.getItem('locale') || getBrowserLocale() || 'ko',
  fallbackLocale: 'en',
  messages: {
    en,
    ko
  }
})

export default i18n
