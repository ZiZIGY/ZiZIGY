import type { Directive } from 'vue'

/*
 * CSS loops keep ticking off screen, and every running animation costs a style recalc on every frame —
 * with the whole page's decor running, that was most of the main thread while nothing was in view.
 * `v-pause-offscreen` marks an element `data-offscreen` while it is out of view (with a margin), and
 * main.css pauses every animation inside it. Put it on sections and other big blocks of decor.
 * GSAP loops have their own switch: `whileOnScreen()` from useGsap.
 */
let observer: IntersectionObserver | undefined

const pauseOffscreen: Directive<HTMLElement> = {
  // a data attribute, not a class: Vue rewrites `class` whenever a bound class changes
  getSSRProps: () => ({}),
  mounted(el) {
    observer ??= new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting)
    }, { rootMargin: '25% 0px' })
    observer.observe(el)
  },
  beforeUnmount(el) {
    observer?.unobserve(el)
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('pause-offscreen', pauseOffscreen)
})

declare module 'vue' {
  interface GlobalDirectives {
    vPauseOffscreen: typeof pauseOffscreen
  }
}
