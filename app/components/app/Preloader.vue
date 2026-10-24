<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '~/data/site'

/*
 * The curtain while the fonts arrive. A counter rolls to 100 like an odometer (its ones spin, tens
 * and hundreds carry over), the stack ticks past under it, and a field of dots lights up in signal
 * from left to right with the progress bar. Then the type rises away and the curtain lifts in six
 * rounded columns, one after another, over the hero typing itself in.
 * The page under it can't be scrolled: the CSS lock below holds from the first paint, before any
 * script, and Lenis is stopped as soon as it exists.
 */
const { t } = useI18n()
const ui = useUiStore()
const lenis = useLenis()

const visible = ref(!ui.isReady)
const root = useTemplateRef<HTMLElement>('root')
const bar = useTemplateRef<HTMLElement>('bar')
const strips = useTemplateRef<HTMLElement[]>('strips')

const COLUMNS = 6
const words = ['Vue', 'Nuxt', 'TypeScript', 'GSAP', 'Three.js', 'GLSL']
const word = ref(0)

watch(lenis, (instance) => {
  if (visible.value) instance?.stop()
}, { immediate: true })

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const clamp = gsap.utils.clamp(0, 1)

// where each digit's strip stands for a value 0–100: the ones roll continuously; tens and hundreds
// move to their next digit only while the place below them turns over from 9 to 0. Cell 10 is a
// second "0", so 9 → 0 rolls on instead of jumping back
function positions(value: number) {
  const tens = Math.floor(value / 10) % 10 + clamp((value % 10) - 9)
  const hundreds = Math.floor(value / 100) % 10 + clamp((value % 100) - 99)
  return [hundreds, tens, value % 10 === 0 && value > 0 ? 10 : value % 10]
}

function show(value: number) {
  const at = positions(value)
  strips.value?.forEach((strip, index) => {
    strip.style.transform = `translateY(${(-at[index]! / 11) * 100}%)`
  })
  root.value?.style.setProperty('--p', (value / 100).toFixed(4))
  if (bar.value) bar.value.style.transform = `scaleX(${value / 100})`
  word.value = Math.min(words.length - 1, Math.floor((value / 100) * words.length))
}

onMounted(async () => {
  if (!visible.value) return
  const el = root.value!
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  lenis.value?.stop()

  // count to 100 while the fonts arrive; SplitText needs final metrics before the hero splits its lines
  const progress = { value: 0 }
  const count = gsap.to(progress, {
    value: 100,
    duration: reduce ? 0.2 : 1.9,
    ease: 'power3.inOut',
    onUpdate: () => show(progress.value),
  })
  await Promise.all([count.then(), Promise.race([document.fonts.ready, wait(2500)])])

  ScrollTrigger.refresh()
  ui.isReady = true

  // the type rises away, the dots go out, and the columns lift one after another
  await gsap.timeline()
    .to('.preloader-rise', { yPercent: -120, duration: reduce ? 0.01 : 0.7, stagger: 0.05, ease: 'expo.in' })
    .to('.preloader-dots', { opacity: 0, duration: reduce ? 0.01 : 0.4 }, '<')
    .to('.preloader-column', { yPercent: -102, duration: reduce ? 0.01 : 1.1, stagger: reduce ? 0 : 0.07, ease: 'expo.inOut' }, '-=0.25')
    .then()

  el.style.visibility = 'hidden'
  visible.value = false
  lenis.value?.start()
})
</script>

<template>
  <div
    v-if="visible"
    ref="root"
    class="preloader fixed inset-0 z-100 text-paper"
    role="status"
    :aria-label="t('preloader.label')"
  >
    <!-- the curtain: six columns, rounded at the bottom, that lift one after another -->
    <div
      class="preloader-curtain"
      aria-hidden="true"
    >
      <i
        v-for="column in COLUMNS"
        :key="column"
        class="preloader-column grain"
        :style="{ '--i': column - 1 }"
      />
    </div>

    <!-- a field of dots, lit in signal from left to right as the page loads -->
    <div
      class="preloader-dots"
      aria-hidden="true"
    />

    <div class="container-site relative flex h-full flex-col justify-between py-7">
      <div class="flex items-center justify-between overflow-clip">
        <span class="preloader-rise font-display text-[1.25rem] font-bold tracking-[-0.04em]">{{ site.brand }}</span>
        <span class="preloader-rise type-overline text-white/70">{{ t('preloader.label') }}</span>
      </div>

      <!-- the counter, the stack and the bar rise away together -->
      <div class="overflow-clip">
        <div class="preloader-rise">
          <div class="flex items-end justify-between gap-6">
            <!-- three digit columns, each a strip 0–9 plus a second 0 -->
            <span
              class="preloader-count type-h1"
              aria-hidden="true"
            >
              <span
                v-for="place in 3"
                :key="place"
                class="preloader-digit"
              >
                <span
                  ref="strips"
                  class="preloader-strip"
                >
                  <span
                    v-for="cell in 11"
                    :key="cell"
                  >{{ (cell - 1) % 10 }}</span>
                </span>
              </span>
            </span>

            <!-- the stack ticks past as the count goes up -->
            <span class="preloader-stack mb-[0.6em] hidden font-display text-sm sm:flex">
              <span class="text-white/50">Frontend ·</span>
              <span class="preloader-word">
                <Transition name="preloader-word">
                  <span :key="word">{{ words[word] }}</span>
                </Transition>
              </span>
            </span>
          </div>
          <!-- scaled from script through transform: Tailwind's scale-x-* would set `scale` and multiply with it -->
          <div class="mt-6 h-1 overflow-hidden rounded-full bg-white/15">
            <div
              ref="bar"
              class="h-full origin-left rounded-full bg-signal"
              style="transform: scaleX(0)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* no scrolling the page under the curtain, from the first paint on, before any script has run */
html:has(.preloader) {
  overflow: hidden;
}
</style>

<style scoped>
.preloader {
  --p: 0;

  touch-action: none;
  overscroll-behavior: none;
  /* failsafe: if scripts never run, the curtain still goes away */
  animation: preloader-failsafe 0.4s 6s forwards;
}

@keyframes preloader-failsafe {
  to {
    opacity: 0;
    visibility: hidden;
  }
}

.preloader-curtain {
  position: absolute;
  inset: 0;
  display: flex;
}

/* a hair wider than a sixth, so no seam shows between neighbours; the rounded bottom hangs below the
   screen until the column lifts, so no page shows through its corners while loading */
.preloader-column {
  position: relative;
  flex: none;
  width: calc(100% / 6 + 1px);
  margin-right: -1px;
  height: calc(100% + 2rem);
  border-radius: 0 0 2rem 2rem;
  background: var(--color-ink);
}

/* quiet paper dots everywhere; the signal ones are uncovered from the left with the progress */
.preloader-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgb(242 241 237 / 0.1) 1.2px, transparent 1.6px);
  background-size: 1.75rem 1.75rem;
  background-position: center;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgb(255 79 26 / 0.6) 1.4px, transparent 1.8px);
    background-size: inherit;
    background-position: inherit;
    mask-image: linear-gradient(90deg, #000 calc(var(--p) * 115% - 15%), transparent calc(var(--p) * 115%));
  }
}

.preloader-count {
  display: inline-flex;
  font-variant-numeric: tabular-nums;
}

/* one digit tall, with room on every side so the glyphs aren't shaved */
.preloader-digit {
  display: inline-block;
  box-sizing: content-box;
  height: 1em;
  padding: 0.08em 0.04em;
  margin: -0.08em -0.04em;
  overflow: hidden;
}

.preloader-strip {
  display: block;
  will-change: transform;

  span {
    display: block;
    height: 1em;
    line-height: 1em;
    text-align: center;
  }
}

.preloader-stack {
  align-items: baseline;
  gap: 0.4em;
}

/* the word slides up out of a window and the next one comes in from below */
.preloader-word {
  position: relative;
  display: inline-grid;
  overflow: hidden;
  padding-block: 0.15em;
  margin-block: -0.15em;

  span {
    grid-area: 1 / 1;
  }
}

.preloader-word-enter-active,
.preloader-word-leave-active {
  transition: translate 0.35s var(--ease-out-expo), opacity 0.35s;
}

.preloader-word-enter-from {
  translate: 0 100%;
  opacity: 0;
}

.preloader-word-leave-to {
  translate: 0 -100%;
  opacity: 0;
}
</style>
