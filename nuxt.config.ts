// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/eslint", "nuxt-auth-sanctum"],
  sanctum: {
    baseUrl: "http://localhost:8000",
  },
  tailwindcss: {
    cssPath: "./global.css",
  },
  imports: {
    autoImport: false,
  },
});
