import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: false },
  typescript: {
    strict: true
  },
  app: {
    head: {
      title: 'Nuxt 应用示例'
    }
  }
})