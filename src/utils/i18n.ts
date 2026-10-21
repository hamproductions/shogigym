import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Lang } from '@/appearance/settings'
import en from '@/locales/en.json'
import ja from '@/locales/ja.json'

export const SETTINGS_KEY = 'joseki-practice:settings:v1'

export function navigatorLang(): Lang {
  try {
    return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en'
  } catch {
    return 'en'
  }
}

function savedLang(): Lang | undefined {
  try {
    const { lang } = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')
    return lang === 'en' || lang === 'ja' ? lang : undefined
  } catch {
    return undefined
  }
}

export const clientLang = (): Lang => savedLang() ?? navigatorLang()

const i18n = createInstance()

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ja: { translation: ja } },
  lng: 'ja',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  initAsync: false,
})

export default i18n
