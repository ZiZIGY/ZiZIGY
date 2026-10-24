import type { NavSection } from '~/data/site'

export const useUiStore = defineStore('ui', () => {
  /** Flips once the preloader has played; the hero intro waits for it. */
  const isReady = ref(false)
  const isMenuOpen = ref(false)

  /** Section under the middle of the viewport, drives the nav indicator. */
  const activeSection = ref<NavSection | null>(null)

  /** A section has the whole screen (the opened showreel): floating chrome like the to-top button steps aside. */
  const immersive = ref(false)

  /**
   * Slug of the project being navigated to/from. Only that card carries a view-transition-name, so the
   * card morphs into the case page (and back) without every card being captured on unrelated transitions.
   */
  const transitionSlug = ref<string | null>(null)

  return { isReady, isMenuOpen, activeSection, immersive, transitionSlug }
})
