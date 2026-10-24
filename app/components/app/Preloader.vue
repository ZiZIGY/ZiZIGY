<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '~/data/site'

const { t } = useI18n()
const ui = useUiStore()
const lenis = useLenis()

const visible = ref(!ui.isReady)
const root = useTemplateRef<HTMLElement>('root')
const counter = useTemplateRef<HTMLElement>('counter')
const bar = useTemplateRef<HTMLElement>('bar')

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

onMounted(async () => {
  if (!visible.value) return
  const el = root.value!
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  lenis.value?.stop()

  // count to 100 while the fonts arrive; SplitText needs final metrics before the hero splits its lines
  const progress = { value: 0 }
  const count = gsap.to(progress, {
    value: 100,
    duration: reduce ? 0.2 : 1.7,
    ease: 'power3.inOut',
    onUpdate: () => {
      counter.value!.textContent = String(Math.round(progress.value)).padStart(3, '0')
      gsap.set(bar.value, { scaleX: progress.value / 100 })
    },
  })
  await Promise.all([count.then(), Promise.race([document.fonts.ready, wait(2500)])])

  ScrollTrigger.refresh()
  ui.isReady = true

  // the curtain lifts while the hero types itself in underneath
  await gsap.timeline({ defaults: { ease: 'expo.inOut' } })
    .to('.preloader-rise', { yPercent: -120, duration: reduce ? 0.01 : 0.8, stagger: 0.05, ease: 'expo.in' })
    .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: reduce ? 0.01 : 1 }, '-=0.3')

  visible.value = false
  lenis.value?.start()
})
</script>

<template>
  <div
    v-if="visible"
    ref="root"
    class="preloader grain fixed inset-0 z-100 bg-ink text-paper"
    style="clip-path: inset(0% 0% 0% 0%)"
    role="status"
    :aria-label="t('preloader.label')"
  >
    <div class="container-site flex h-full flex-col justify-between py-7">
      <div class="flex items-center justify-between overflow-clip">
        <span class="preloader-rise font-display text-[1.25rem] font-bold tracking-[-0.04em]">{{ site.brand }}</span>
        <span class="preloader-rise type-overline text-white/70">{{ t('preloader.label') }}</span>
      </div>

      <div class="overflow-clip">
        <div class="preloader-rise flex items-end justify-between gap-6">
          <span
            ref="counter"
            class="type-h1 tabular-nums"
          >000</span>
          <span class="mb-[0.6em] hidden font-display text-sm text-white/70 sm:block">Frontend · Vue · Nuxt</span>
        </div>
        <div class="preloader-rise mt-6 h-px bg-white/20">
          <div
            ref="bar"
            class="h-full origin-left scale-x-0 bg-signal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* failsafe: if scripts never run, the curtain still goes away */
.preloader {
  animation: preloader-failsafe 0.4s 6s forwards;
}

@keyframes preloader-failsafe {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
