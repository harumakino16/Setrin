// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'zh-TW'],
    localeDetection: false
  },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development'
};