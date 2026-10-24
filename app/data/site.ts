// Personal details from the résumé. Copy that changes with the language lives in i18n (`site.*`).
export const site = {
  /** the handle, used as the wordmark (header, preloader, footer, the showreel's edge print) */
  brand: 'ZiZIGY',
  email: 'zizigydev@gmail.com',
  resume: '/resume.pdf',
  github: 'https://github.com/ZiZIGY',
  articles: 'https://habr.com/ru/users/ZiZIGY/articles/',
  socials: [
    { name: 'Telegram', href: 'https://t.me/ZiZIGY' },
    { name: 'GitHub', href: 'https://github.com/ZiZIGY' },
    { name: 'Habr', href: 'https://habr.com/ru/users/ZiZIGY/' },
    { name: 'vue-dnd-kit', href: 'https://github.com/ZiZIGY/vue-dnd-kit' },
  ],
  tools: [
    'Vue 3', 'Nuxt', 'TypeScript', 'React', 'Next.js', 'Pinia', 'VueUse', 'Tailwind CSS',
    'shadcn-vue', 'GSAP', 'Three.js', 'TresJS', 'GLSL', 'Electron', 'Vite', 'Storybook',
  ],
  timeZone: 'Europe/Moscow',
} as const

export const navSections = ['projects', 'services', 'about', 'experience', 'contact'] as const

export type NavSection = (typeof navSections)[number]
