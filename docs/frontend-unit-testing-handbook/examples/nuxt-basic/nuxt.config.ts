import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: false },
  typescript: {
    strict: true
  }
});