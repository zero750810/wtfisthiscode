import { createI18n } from 'vue-i18n'
import en from './en'
import zhTW from './zh-TW'

const savedLocale = localStorage.getItem('locale') ?? 'zh-TW'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    'zh-TW': zhTW,
    'en': en,
  },
})
