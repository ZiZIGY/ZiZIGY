export interface ViewTransitionRunOptions {
  /** Transition types, styled in view-transitions.css via `:active-view-transition-type(...)`. */
  types?: string[]
}

/**
 * Wraps DOM updates in `document.startViewTransition`.
 *
 * Browsers without the API or without transition types (types are what keep the theme, locale and
 * route animations apart), and users who prefer reduced motion, get the update applied instantly.
 */
export function useViewTransition() {
  const reducedMotion = usePreferredReducedMotion()

  const isSupported = useSupported(() =>
    typeof document.startViewTransition === 'function'
    && typeof ViewTransition !== 'undefined'
    && 'types' in ViewTransition.prototype,
  )

  /** Resolves to the running transition, or `undefined` when the update was applied without one. */
  async function run(update: () => unknown, { types = [] }: ViewTransitionRunOptions = {}) {
    if (!isSupported.value || reducedMotion.value === 'reduce') {
      await update()
      return
    }

    return document.startViewTransition({
      // the new snapshot is taken once this resolves, so wait for Vue to flush the change to the DOM
      update: async () => {
        await update()
        await nextTick()
      },
      types,
    })
  }

  return { isSupported, run }
}
