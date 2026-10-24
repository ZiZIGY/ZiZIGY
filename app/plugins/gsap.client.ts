import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

// Every GSAP plugin is free since 3.13 — register more here (Flip, CustomEase, DrawSVG, ...) when a section needs them.
export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger, SplitText)

  // the layout (header, footer) outlives pages: once a new page has rendered, every trigger re-measures
  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(() => ScrollTrigger.refresh())
  })

  // handy in devtools: gsap.getTweensOf(el), ScrollTrigger.getAll()
  if (import.meta.dev) Object.assign(window, { gsap, ScrollTrigger })
})
