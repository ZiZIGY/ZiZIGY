<script setup lang="ts">
import { gsap } from 'gsap'
import { site } from '~/data/site'

const { t } = useI18n()

const year = new Date().getFullYear()
const letters = site.brand.split('')

const root = useTemplateRef<HTMLElement>('root')

useGsap(({ reduceMotion }) => {
  if (reduceMotion) return

  // the closing wordmark rises letter by letter as you reach the very end
  gsap.from('.wordmark-letter', {
    yPercent: 100,
    rotate: 8,
    transformOrigin: '0% 100%',
    ease: 'none',
    stagger: 0.12,
    scrollTrigger: { trigger: '.wordmark', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
  })
}, root)
</script>

<template>
  <footer
    ref="root"
    v-pause-offscreen
    class="relative overflow-hidden pt-10"
  >
    <div class="container-site flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-sm text-muted-foreground">
      <span>{{ t('footer.copyright', { year }) }}</span>
      <span class="liquid-glass glass-on-light inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-foreground">
        <span class="size-1.5 rounded-full bg-signal shadow-[0_0_0.5rem_var(--color-signal)]" />
        {{ t('site.city') }}, {{ t('footer.time') }} <FxLiveClock class="font-semibold" />
      </span>
      <!-- the way back up is the floating drop (AppToTop), always at hand -->
      <span>{{ t('footer.made') }}</span>
    </div>

    <div
      class="wordmark container-site mt-6 flex items-start overflow-clip font-display leading-[0.78] font-bold tracking-normal text-foreground select-none"
      aria-hidden="true"
    >
      <span
        v-for="(letter, index) in letters"
        :key="index"
        class="wordmark-letter inline-block"
      >{{ letter }}</span>
    </div>
  </footer>
</template>

<style scoped>
.wordmark {
  /* the handle spans the container width */
  font-size: clamp(3.5rem, 21.9vw, 26rem);
  /* the clip is there for the letters rising from below; the top padding keeps it off the caps */
  padding-top: 0.1em;
  padding-bottom: 0.02em;
}

/* the gutters take a smaller share of a wide screen, so the letters can be a touch bigger there */
@media (width >= 64rem) {
  .wordmark {
    font-size: clamp(3.5rem, 22.6vw, 26rem);
  }
}
</style>
