module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:prettier/recommended'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/order': 'off',
    'import/first': 'off',
    'import/no-duplicates': 'off',
    'sort-imports': 'off',
    'react/no-unstable-nested-components': 'off',
  },
};
