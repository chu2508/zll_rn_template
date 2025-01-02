import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/zh';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ja from './ja.json';
import { getLanguage, getLanguageCode } from './language';
import zhHans from './zh-Hans.json';
import zhHant from './zh-Hant.json';

const lng = getLanguage();
const locale = getLanguageCode();
dayjs.locale(locale);

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
    ja: {
      translation: ja,
    },
  },
  lng: lng, // 使用系统语言
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});
