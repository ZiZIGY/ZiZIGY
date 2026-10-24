import tailwindcss from '@tailwindcss/vite'

// set by the GitHub Pages workflow (/ZiZIGY/); Nuxt reads it on its own, the prerender ignore below needs it too
const baseURL = process.env.NUXT_APP_BASE_URL ?? '/'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'shadcn-nuxt',
    'motion-v/nuxt',
    'lenis/nuxt',
  ],

  devtools: { enabled: true },

  app: {
    // linked explicitly, or browsers ask for /favicon.ico at the domain root, outside the base
    head: { link: [{ rel: 'icon', href: `${baseURL}favicon.ico` }] },
  },

  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],

  colorMode: {
    // `.dark` / `.light` on <html>, which is what the shadcn tokens and Tailwind's `dark:` variant key off
    classSuffix: '',
    // the theme switch is animated by a view transition, CSS transitions would only fight with it
    disableTransition: true,
  },

  experimental: {
    // route changes run inside document.startViewTransition; skipped automatically for prefers-reduced-motion
    viewTransition: true,
  },

  compatibilityDate: '2025-07-15',

  nitro: {
    prerender: {
      // the crawler also follows the links with the base in front, which renders every page a second time
      ignore: baseURL === '/' ? [] : [(route: string) => route.startsWith(baseURL)],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    css: {
      preprocessorOptions: {
        scss: {
          // breakpoints, mixins and functions are available in every <style lang="scss"> without an import
          additionalData: '@use "~/assets/scss/abstracts" as *;\n',
        },
      },
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  fonts: {
    // @nuxt/fonts only fetches weight 400 unless told otherwise
    families: [
      { name: 'Unbounded', provider: 'google', weights: [500, 600, 700] },
      { name: 'Onest', provider: 'google', weights: [400, 500, 600] },
    ],
    defaults: {
      styles: ['normal'],
      subsets: ['cyrillic-ext', 'cyrillic', 'latin-ext', 'latin'],
    },
  },

  i18n: {
    // one URL for both languages; the locale comes from the cookie, otherwise from Accept-Language / navigator
    strategy: 'no_prefix',
    // used for og:url / canonical; set NUXT_PUBLIC_I18N_BASE_URL to the real domain in production
    baseUrl: 'http://localhost:3000',
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'en',
    },
  },

  motionV: {
    // motion-v's useScroll / useAnimate collide with VueUse auto-imports, so its composables are imported explicitly from 'motion-v'
    utilities: false,
  },

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
})
