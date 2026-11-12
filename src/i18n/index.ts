import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { translations } from './translations'
import { detectBrowserLanguage } from '../utils/locale'

export const defaultNS = 'translation'

export const resources = {
  en: { translation: translations.en },
  ko: { translation: translations.ko },
  ja: { translation: translations.ja },
  es: { translation: translations.es },
  zh: { translation: translations.zh },
} as const

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? detectBrowserLanguage() : 'en',
    fallbackLng: 'en',
    defaultNS,
    interpolation: {
      escapeValue: false, // React handles escaping natively
    },
  })

export default i18n
