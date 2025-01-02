import { getLocales } from 'react-native-localize';

const locales = getLocales();
console.log('locales', locales);
export const getLanguage = () => {
  const code = locales[0].languageCode;
  const tag = locales[0].languageTag;
  if (code === 'zh') {
    if (tag.startsWith('zh-Hans')) return 'zh-Hans';
    if (tag.startsWith('zh-Hant')) return 'zh-Hant';
    return 'zh-Hans';
  } else {
    return code;
  }
};

export const getLanguageCode = () => {
  let locale = locales[0].languageCode;
  return locale;
};
