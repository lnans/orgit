import en from '@client/locales/en.json'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

i18next.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
  },
  fallbackLng: ['en'],
  supportedLngs: ['en'],
})

export { i18next }
