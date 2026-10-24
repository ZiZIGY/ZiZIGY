const REVEAL_DURATION = 700
const REVEAL_EASING = 'cubic-bezier(0.76, 0, 0.24, 1)'

/** Light/dark switching on top of @nuxtjs/color-mode, animated as a circular reveal. */
export function useTheme() {
  const colorMode = useColorMode()
  const { run } = useViewTransition()

  const isDark = computed(() => colorMode.value === 'dark')

  /**
   * Flips the theme. Pass the click event and the new theme grows out of the clicked element's
   * centre; without it, out of the viewport centre.
   */
  async function toggle(event?: Event) {
    // read before any await: currentTarget is reset once the event finishes dispatching
    const origin = event?.currentTarget instanceof Element
      ? event.currentTarget.getBoundingClientRect()
      : null
    const x = origin ? origin.left + origin.width / 2 : innerWidth / 2
    const y = origin ? origin.top + origin.height / 2 : innerHeight / 2

    const transition = await run(() => {
      colorMode.preference = isDark.value ? 'light' : 'dark'
    }, { types: ['theme'] })

    if (!transition) return

    // radius that reaches the farthest viewport corner from the origin
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    await transition.ready
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: REVEAL_DURATION, easing: REVEAL_EASING, pseudoElement: '::view-transition-new(root)' },
    )
  }

  return { colorMode, isDark, toggle }
}
