const easeInOutExpo = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2

/** Smooth-scrolls to a home section; from any other page it navigates home first. */
export function useSectionNav() {
  const route = useRoute()
  const lenis = useLenis()
  const ui = useUiStore()

  async function scrollToSection(id: string) {
    ui.isMenuOpen = false
    if (route.path !== '/') {
      await navigateTo(id === 'top' ? '/' : { path: '/', hash: `#${id}` })
      return
    }
    // the mobile menu keeps Lenis stopped; its watcher would restart it only after this call
    lenis.value?.start()
    lenis.value?.scrollTo(id === 'top' ? 0 : `#${id}`, { duration: 1.8, easing: easeInOutExpo })
  }

  /** Back to the top of the page you're on: a case page stays a case page. */
  function scrollToTop() {
    ui.isMenuOpen = false
    lenis.value?.start()
    lenis.value?.scrollTo(0, { duration: 1.8, easing: easeInOutExpo })
  }

  return { scrollToSection, scrollToTop }
}
