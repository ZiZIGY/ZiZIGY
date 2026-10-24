// Work history from the résumé, oldest first. Company, role and highlights are in i18n (`experience.items.<id>`).
export interface Experience {
  id: string
  /** ISO year-month */
  from: string
  /** ISO year-month, or null for the current job */
  to: string | null
  stack: string[]
}

export const experience: Experience[] = [
  { id: 'st', from: '2019-07', to: '2022-04', stack: ['Vue.js', 'TypeScript', 'Node.js', 'WebSocket'] },
  { id: 'elros', from: '2022-04', to: '2023-01', stack: ['Vue.js', 'Vuetify', 'PHP', '1С-Битрикс'] },
  { id: 'bintaga', from: '2023-01', to: '2025-07', stack: ['Nuxt 3', 'TypeScript', 'GSAP', 'TresJS', 'Tailwind'] },
  { id: 'ventra', from: '2025-12', to: null, stack: ['Nuxt 4', 'TypeScript', 'shadcn-vue', 'Valibot'] },
]

export const education = { year: 2021 }
