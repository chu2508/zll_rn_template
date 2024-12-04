module.exports = {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: 'all',
  tabWidth: 2,
  importOrder: [
    './gesture-handler',
    './global.css',
    './src/sheets',
    './src/i18n/i18n',
    './src/common/sheets',
    '<THIRD_PARTY_MODULES>',
    '^[./]',
    '^@src/(.*)$',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
};
