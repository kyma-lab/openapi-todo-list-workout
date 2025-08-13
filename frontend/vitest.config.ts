/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    // Exclude playwright test files from vitest
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
