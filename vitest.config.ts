import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/types.ts',
        '**/*.types.ts'
      ],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    testTimeout: 10000,
    hookTimeout: 10000,
    watch: false,
    reporters: ['verbose'],
    chaiConfig: {
      truncateThreshold: 1000
    }
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@components': new URL('./src/components', import.meta.url).pathname,
      '@services': new URL('./src/services', import.meta.url).pathname,
      '@types': new URL('./src/types', import.meta.url).pathname,
      '@contexts': new URL('./src/contexts', import.meta.url).pathname,
      '@utils': new URL('./src/utils', import.meta.url).pathname,
      '@tests': new URL('./src/tests', import.meta.url).pathname
    }
  }
});