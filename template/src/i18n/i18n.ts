import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import { getLanguage } from './language';
import zhHans from './zh-Hans.json';
import zhHant from './zh-Hant.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v2',

  resources: {
    en: {
      translation: en,
    },
    ['zh-Hans']: {
      translation: zhHans,
    },
    ['zh-Hant']: {
      translation: zhHant,
    },
  },
  lng: getLanguage(), // 使用系统语言
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});
