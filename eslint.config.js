import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: '18.3' },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
          moduleDirectory: ['node_modules', 'src/'],
        },
        alias: {
          map: [
            ['@', './src']
          ],
          extensions: ['.js', '.jsx']
        }
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // 🛡️ ANTI-TIME-BOMB RULES
      
      // Catch undefined variables (like missing imports) - CRITICAL
      'no-undef': 'warn',
      
      // Prevent unused variables - but be lenient
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      
      // Catch missing imports - CRITICAL
      'import/no-unresolved': 'warn',
      
      // Prevent console.log in production
      'no-console': 'warn',
      
      // Catch potential runtime errors
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      
      // React-specific protections
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-unescaped-entities': 'error',
      
      // Catch common React mistakes
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Prevent accidental assignments in conditions
      'no-cond-assign': 'error',
      
      // Catch potential null/undefined issues
      'no-eq-null': 'error',
      
      // Prevent unreachable code
      'no-unreachable-loop': 'error',
    },
  },
]
