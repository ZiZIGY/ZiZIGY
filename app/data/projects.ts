// Copy (title, type, summary, facts, ...) lives in i18n under `projects.items.<slug>`.
// Every project has its own page in pages/projects/<slug>.vue, built from the components/project/case blocks.
export type ProjectVisual = 'dnd' | 'orb' | 'sprites' | 'editor'
// neutral planes only: signal stays the accent inside the scenes, never a whole card
export type ProjectTone = 'sand' | 'ink' | 'stone' | 'white'

export interface ProjectLink {
  kind: 'github' | 'demo'
  href: string
}

export interface Project {
  slug: string
  /** The CSS scene shown when there is no screenshot (and on the case pages' extras). */
  visual: ProjectVisual
  /**
   * A real screenshot: `public/images/projects/<image>-{640,1200,1920}.{avif,webp}` (re-export with
   * sharp from the source PNG in public/). Screenshots are dark UIs, so their cards use the ink tone.
   */
  image?: string
  tone: ProjectTone
  links: ProjectLink[]
}

export const projects: Project[] = [
  {
    slug: 'vue-dnd-kit',
    visual: 'dnd',
    tone: 'sand',
    links: [{ kind: 'github', href: 'https://github.com/ZiZIGY/vue-dnd-kit' }],
  },
  {
    slug: 'wispbringer',
    visual: 'orb',
    image: 'wispbringer',
    tone: 'ink',
    links: [
      { kind: 'demo', href: 'https://zizigy.github.io/WispbringerDemo/' },
      { kind: 'github', href: 'https://github.com/ZiZIGY/WispbringerDemo' },
    ],
  },
  {
    slug: 'spritecutter',
    visual: 'sprites',
    image: 'spritecutter',
    tone: 'ink',
    links: [{ kind: 'demo', href: 'https://zizigy.github.io/SpriteCutter/' }],
  },
  {
    // closed project, nothing public to link to yet
    slug: 'engine',
    visual: 'editor',
    image: 'engine',
    tone: 'ink',
    links: [],
  },
]

/** `<source>` sets for a project screenshot, largest format first. */
export function imageSources(image: string) {
  const set = (format: string) => [640, 1200, 1920].map(width => `${withBase(`/images/projects/${image}-${width}.${format}`)} ${width}w`).join(', ')
  return [
    { type: 'image/avif', srcset: set('avif') },
    { type: 'image/webp', srcset: set('webp') },
  ]
}

/** Background + text pairing for each card tone. */
export const toneClasses: Record<ProjectTone, string> = {
  // a warm near-black in the dark theme: a light sand plane glared against the dark page
  sand: 'bg-sand text-ink dark:bg-[#211e1a] dark:text-paper dark:ring-1 dark:ring-white/10 dark:ring-inset',
  ink: 'bg-ink text-paper dark:ring-1 dark:ring-white/10 dark:ring-inset',
  stone: 'bg-stone text-ink',
  white: 'bg-white text-ink ring-1 ring-border ring-inset',
}

/** Tones with light type need the dark variant of glass and light (sand turns dark only with the theme, see Card). */
export const isDarkTone = (tone: ProjectTone) => tone === 'ink'

export function findProject(slug: string) {
  return projects.find(project => project.slug === slug)
}

export function nextProject(slug: string) {
  const index = projects.findIndex(project => project.slug === slug)
  return projects[(index + 1) % projects.length]!
}

export const demoLink = (project: Project) => project.links.find(link => link.kind === 'demo')?.href
