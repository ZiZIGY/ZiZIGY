<script setup lang="ts">
import { gsap } from 'gsap'
import { navSections, site } from '~/data/site'

const { t } = useI18n()
const ui = useUiStore()
const route = useRoute()
const lenis = useLenis()
const { scrollToSection } = useSectionNav()

const root = useTemplateRef<HTMLElement>('root')
let timeline: gsap.core.Timeline | undefined

useGsap(({ reduceMotion }) => {
  const el = root.value
  if (!el) return

  // the ink plane grows out of the burger, then the links rise one after another
  timeline = gsap.timeline({
    paused: true,
    defaults: { ease: 'expo.out' },
    onReverseComplete: () => {
      gsap.set(el, { visibility: 'hidden' })
    },
  })
    .set(el, { visibility: 'visible' })
    .fromTo(
      el,
      { clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)' },
      { clipPath: 'circle(150% at calc(100% - 2.5rem) 2.5rem)', duration: reduceMotion ? 0.01 : 0.9, ease: 'expo.inOut' },
    )
    .from('.menu-link-inner', { yPercent: 115, rotate: 6, duration: 0.9, stagger: 0.06 }, reduceMotion ? 0 : '-=0.45')
    .from('.menu-foot > *', { y: 20, opacity: 0, duration: 0.8, stagger: 0.06 }, '<0.15')

  if (ui.isMenuOpen) timeline.progress(1)
}, root)

watch(() => ui.isMenuOpen, (open) => {
  if (open) {
    lenis.value?.stop()
    timeline?.timeScale(1).play()
  }
  else {
    lenis.value?.start()
    // closing runs faster than opening
    timeline?.timeScale(1.6).reverse()
  }
})

watch(() => route.fullPath, () => {
  ui.isMenuOpen = false
})

onKeyStroke('Escape', () => {
  ui.isMenuOpen = false
})
</script>

<template>
  <div
    ref="root"
    class="menu grain invisible fixed inset-0 z-40 bg-ink text-paper lg:hidden"
    :inert="!ui.isMenuOpen"
  >
    <div class="container-site flex h-full flex-col justify-between pt-[calc(var(--header-h)+3rem)] pb-8">
      <nav
        class="flex flex-col"
        :aria-label="t('nav.menu')"
      >
        <a
          v-for="(id, index) in navSections"
          :key="id"
          :href="withBase(`/#${id}`)"
          class="menu-link group flex items-baseline gap-4 overflow-clip py-1"
          @click.prevent="scrollToSection(id)"
        >
          <span class="menu-link-inner flex items-baseline gap-4">
            <span class="font-display text-sm text-signal">0{{ index + 1 }}</span>
            <span class="type-h2 transition-colors group-hover:text-signal">{{ t(`nav.${id}`) }}</span>
          </span>
        </a>
      </nav>

      <div class="menu-foot flex flex-col gap-5">
        <a
          :href="`mailto:${site.email}`"
          class="font-display text-xl font-semibold underline decoration-1 underline-offset-6"
        >{{ site.email }}</a>
        <ul class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-white/80">
          <li
            v-for="social in site.socials"
            :key="social.name"
          >
            <a
              :href="social.href"
              target="_blank"
              rel="noopener"
              class="hover:text-signal"
            >{{ social.name }} ↗</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
