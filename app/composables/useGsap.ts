import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { MaybeRefOrGetter, WatchSource } from 'vue'

export interface GsapConditions {
  /** Viewport is at least Tailwind's `lg` (64rem). */
  isDesktop: boolean
  /** Viewport is below `lg`. Always the opposite of `isDesktop`. */
  isMobile: boolean
  /** The OS asks for reduced motion: skip or simplify the animation. */
  reduceMotion: boolean
}

/** May return a cleanup function; it runs right before the context reverts. */
type GsapSetup = (conditions: GsapConditions, context: gsap.Context) => (() => void) | undefined

interface GsapOptions {
  /**
   * Re-run the setup when this changes. Needed whenever the animated markup is split by SplitText
   * and its text can change (locale switch): the split is reverted before Vue patches the new text
   * in, then the fresh text is split again.
   */
  deps?: WatchSource
}

/**
 * Vue counterpart of `useGSAP` from @gsap/react.
 *
 * Runs `setup` after mount inside `gsap.matchMedia`, scoped to `scope` (selector strings only match
 * its descendants). Every tween, timeline, ScrollTrigger and SplitText created inside is reverted
 * when a media condition flips (then `setup` runs again) and when the component unmounts.
 *
 * @example
 * const root = useTemplateRef('root')
 * useGsap(({ reduceMotion }) => {
 *   if (reduceMotion) return
 *   gsap.from('.card', { y: 80, opacity: 0, stagger: 0.1, scrollTrigger: { trigger: '.cards', start: 'top 80%' } })
 * }, root)
 */
export function useGsap(setup: GsapSetup, scope?: MaybeRefOrGetter<Element | null | undefined>, options: GsapOptions = {}) {
  let mm: gsap.MatchMedia | undefined

  function init() {
    mm = gsap.matchMedia(toValue(scope) ?? undefined)
    // isDesktop/isMobile are complementary, so at least one condition always matches and setup always runs
    mm.add(
      {
        isDesktop: '(width >= 64rem)',
        isMobile: '(width < 64rem)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop = false, isMobile = false, reduceMotion = false } = context.conditions ?? {}
        return setup({ isDesktop, isMobile, reduceMotion }, context)
      },
    )
  }

  function kill() {
    mm?.revert()
    mm = undefined
  }

  onMounted(init)
  onBeforeUnmount(kill)

  if (options.deps) {
    // default 'pre' flush: runs before the component re-renders, i.e. while the split markup is still the old one
    watch(options.deps, () => {
      kill()
      nextTick(init)
    })
  }
}

/**
 * Endless loops should only run while you can see them. Call inside a `useGsap` setup (so the trigger
 * reverts with it): `toggle(true)` when `trigger` scrolls into view, `toggle(false)` when it leaves.
 * Also called on every refresh — `onToggle` alone never fires for something that starts off screen,
 * which left those loops running for good.
 */
export function whileOnScreen(trigger: Element, toggle: (onScreen: boolean) => void) {
  const sync = (self: ScrollTrigger) => toggle(self.isActive)
  return ScrollTrigger.create({ trigger, start: 'top bottom', end: 'bottom top', onToggle: sync, onRefresh: sync })
}
