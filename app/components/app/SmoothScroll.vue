<script setup lang="ts">
import type { LenisOptions } from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const reducedMotion = usePreferredReducedMotion()

// VueLenis deep-watches options and rebuilds Lenis on every change, so keep the object stable
const options = computed<LenisOptions>(() => ({
  // plain native scrolling for people who asked the OS to reduce motion
  smoothWheel: reducedMotion.value !== 'reduce',
}))

// every Lenis scroll tick updates ScrollTrigger, so pinned/scrubbed animations never lag behind
const lenis = useLenis(ScrollTrigger.update)

// GSAP's ticker drives Lenis instead of Lenis' own rAF loop: both read the same frame
function raf(time: number) {
  lenis.value?.raf(time * 1000)
}

// A route change must not inherit the previous page's inertia: Lenis would keep easing towards its old
// target and override the router's scroll to the top — on a shorter page that lands in the footer.
// Jumping to where we already are cancels the glide (stop() would also clip <html> and block the router).
function halt() {
  const instance = lenis.value
  if (instance && !instance.isStopped) instance.scrollTo(instance.actualScroll, { immediate: true, force: true })
}

const removeGuard = useRouter().beforeEach(() => {
  halt()
})
const removeHook = useNuxtApp().hook('page:finish', halt)

onMounted(() => {
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
})

onBeforeUnmount(() => {
  gsap.ticker.remove(raf)
  removeGuard()
  removeHook()
})
</script>

<template>
  <VueLenis
    root
    :auto-raf="false"
    :options="options"
  />
</template>
