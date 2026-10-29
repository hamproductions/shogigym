import { createInstance, type BackendModule, type ResourceKey } from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Lang } from '@/appearance/settings'
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

let english: Promise<ResourceKey> | null = null
const loadEnglish = () => {
  if (!english) {
    english = import('@/locales/en.json').then((module) => module.default)
    english.catch(() => (english = null))
  }
  return english
}

if (typeof window !== 'undefined' && clientLang() === 'en') void loadEnglish().catch(() => undefined)

const locales: BackendModule = {
  type: 'backend',
  init: () => undefined,
  read: (language, _namespace, callback) => {
    if (language !== 'en') return callback(null, ja)
    loadEnglish().then(
      (resources) => callback(null, resources),
      (error: Error) => callback(error, null),
    )
  },
}

const i18n = createInstance()

void i18n
  .use(locales)
  .use(initReactI18next)
  .init({
    resources: { ja: { translation: ja } },
    partialBundledLanguages: true,
    lng: 'ja',
    fallbackLng: 'ja',
    interpolation: { escapeValue: false },
    initAsync: false,
  })

export default i18n
