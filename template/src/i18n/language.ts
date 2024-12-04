import { getLocales } from 'react-native-localize';

export const getLanguage = () => {
  const locales = getLocales();
  let locale = locales[0].languageTag;

  // 处理 languageTag，提取主要的语言代码
  if (locale.startsWith('zh-Hans')) {
    locale = 'zh-Hans'; // 简体中文
  } else if (locale.startsWith('zh-Hant')) {
    locale = 'zh-Hant'; // 繁体中文
  } else {
    locale = 'en'; // 默认回退到英语
  }

  return locale;
};
