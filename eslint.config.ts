import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  ignores: ['.vite/**'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-empty': ['error', { allowEmptyCatch: false }],
    'no-useless-catch': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
  },
})
