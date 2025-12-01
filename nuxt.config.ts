// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/content",
    "@vueuse/motion/nuxt",
    "@nuxtjs/supabase",
    "nuxt-nodemailer",
    "nuxt-email-renderer",
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  build: {
    transpile: ["@nuxtjs/supabase", "@supabase/supabase-js"],
  },

  routeRules: {
    "/api/**": {
      cors: true,
    },
  },

  compatibilityDate: "2024-07-11",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false,
  },
  nodemailer: {
    from: process.env.NUXT_NODEMAILER_FROM,
    host: process.env.NUXT_NODEMAILER_HOST,
    port: Number(process.env.NUXT_NODEMAILER_PORT),
    secure: true,
    auth: {
      user: process.env.NUXT_NODEMAILER_AUTH_USER,
      pass: process.env.NUXT_NODEMAILER_AUTH_PASS,
    },
  },
});