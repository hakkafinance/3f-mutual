import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import XHR from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18next
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
    react: {
      useSuspense: true,
    },
    whitelist: ['zh', 'en'],
    nonExplicitWhitelist: true,
    fallbackLng: {
      'zh': ['zh-CN', 'zh-TW', 'en-US'],
      'zh-TW': ['zh-TW', 'zh-CN', 'en-US'],
      'default': ['en-US']
    },
    keySeparator: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['navigator', 'cookie', 'localStorage'],
    }
  })

export default i18next
