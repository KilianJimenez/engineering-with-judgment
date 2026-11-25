import { defineConfig } from 'vite';
import { BASE } from './scripts/site.mjs';

export default defineConfig({
  base: BASE,
  build: {
    rollupOptions: {
      input: { es: 'index.html', en: 'en/index.html' },
    },
  },
});
