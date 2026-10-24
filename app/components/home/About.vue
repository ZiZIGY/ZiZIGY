<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/*
 * About as a magazine spread: the portrait stays on the left for the whole read while the story runs
 * on the right, the statement and then three principles. Each principle turns the portrait into a
 * picture of itself (the chapters of HomeAboutPortrait), locked to the scroll. Then the tools jar.
 */
const { t, locale } = useI18n()

const root = useTemplateRef<HTMLElement>('root')
const portrait = useTemplateRef<{ setProgress: (value: number) => void, $el: HTMLElement }>('portrait')
// the principle being read, 1…3 (0 while the statement is): for the caption and the highlight
const chapter = ref(0)

useSectionSpy(root, 'about')

const principles = computed(() => [0, 1, 2].map(index => ({
  title: t(`about.principles.${index}.title`),
  text: t(`about.principles.${index}.text`),
})))

useGsap(({ isDesktop, reduceMotion }) => {
  const el = root.value
  if (!el) return

  // the reading position, 0…3. On desktop the principles move it, each one while it rises through
  // the screen; on phones the portrait isn't sticky, so its own pass through the screen does.
  // Reduced motion gets the chapters without the transitions between them.
  const show = (value: number) => {
    portrait.value?.setProgress(value)
    // chapter n plays while the reading position goes from n - 1 to n, so its caption shows from the start
    chapter.value = value < 0.05 ? 0 : Math.min(3, Math.ceil(value - 0.05))
  }
  const snap = (value: number) => (reduceMotion ? Math.round(value) : value)

  if (isDesktop) {
    const parts = [0, 0, 0]
    gsap.utils.toArray<HTMLElement>('.principle', el).forEach((row, index) => {
      const read = (self: ScrollTrigger) => {
        parts[index] = snap(self.progress)
        show(parts.reduce((sum, part) => sum + part, 0))
      }
      ScrollTrigger.create({ trigger: row, start: 'top 80%', end: 'top 40%', onUpdate: read, onRefresh: read })
    })
  }
  else if (portrait.value) {
    const read = (self: ScrollTrigger) => show(snap(self.progress * 3))
    ScrollTrigger.create({ trigger: portrait.value.$el, start: 'top 75%', end: 'bottom 45%', onUpdate: read, onRefresh: read })
  }
  return undefined
}, root, { deps: locale })
</script>

<template>
  <section
    id="about"
    ref="root"
    v-pause-offscreen
    class="py-[clamp(5rem,11vw,11rem)]"
  >
    <div class="container-site grid gap-12 lg:grid-cols-12 lg:gap-(--col-gap)">
      <div class="lg:col-span-5">
        <HomeAboutPortrait
          ref="portrait"
          :chapter="chapter"
        />
      </div>

      <div class="lg:col-span-7">
        <p class="type-overline text-signal">
          {{ t('about.overline') }}
        </p>
        <HomeAboutStatement class="mt-6" />
        <p class="type-lead mt-8 max-w-xl text-muted-foreground">
          {{ t('about.text') }}
        </p>

        <ol class="mt-16">
          <li
            v-for="(principle, index) in principles"
            :key="index"
            class="principle"
            :class="{ 'is-active': chapter === index + 1 }"
          >
            <span class="principle-no">{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <h3 class="font-display text-[clamp(1.5rem,2.6vw,2.5rem)] leading-tight font-semibold tracking-[-0.035em]">
                {{ principle.title }}
              </h3>
              <p class="type-lead mt-4 max-w-xl text-muted-foreground">
                {{ principle.text }}
              </p>
            </div>
          </li>
        </ol>

        <HomeAboutToolsJar class="mt-12" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
/* ——— principles ——— */

// on desktop each principle gets a screen's worth of reading; the one being read is in focus
.principle {
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  gap: 1rem;
  padding-block: 2rem;
  border-top: 1px solid var(--border);

  @include up(lg) {
    min-height: 42vh;
    padding-bottom: 0;
    opacity: 0.35;
    transition: opacity 0.5s;

    &.is-active {
      opacity: 1;
    }
  }
}

.principle-no {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-signal);
}
</style>
