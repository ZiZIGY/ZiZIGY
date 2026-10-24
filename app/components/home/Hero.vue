<script setup lang="ts">
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { site } from '~/data/site'

const { t, locale } = useI18n()
const ui = useUiStore()
const { scrollToSection } = useSectionNav()

const root = useTemplateRef<HTMLElement>('root')

// the drop sits to the right of the headline; phones have no room beside it, so they go without
const blob = { x: 0.79, y: 0.4, size: 0.165 }

// the intro plays once; a locale switch re-splits the new copy and lays it out in its final state
let introPlayed = false

useGsap(({ reduceMotion, isDesktop: desktop }, context) => {
  const el = root.value
  if (!el || reduceMotion) return

  const build = () => {
    const words = gsap.utils.toArray<HTMLElement>('.hero-seg', el)
      .flatMap(seg => SplitText.create(seg, { type: 'words,chars', mask: 'words', wordsClass: 'split-word', aria: 'none' }).chars)
    const lead = SplitText.create('.hero-lead', { type: 'lines', mask: 'lines', linesClass: 'split-line' })

    // nothing that holds liquid glass fades: opacity < 1 would cut the glass off from what's behind it
    const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .from('.hero-blob', { scale: 0.6, transformOrigin: `${blob.x * 100}% ${blob.y * 100}%`, duration: 2.2, ease: 'elastic.out(1, 0.55)' }, 0)
      .from('.hero-chip', { scale: 0.4, y: 20, duration: 1.1, ease: 'back.out(1.8)' }, 0.1)
      .from('.hero-meta-text', { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.18)
      .from(words, { yPercent: 120, rotate: 9, transformOrigin: '0% 100%', duration: 1.35, stagger: 0.016 }, 0.2)
      .from('.hero-pill', { scale: 0, rotate: -30, duration: 1.3, ease: 'back.out(1.7)', stagger: 0.3 }, 0.6)
      .from('.hero-accent', { yPercent: 70, rotate: 8, opacity: 0, duration: 1.2 }, 0.85)
      .from(lead.lines, { yPercent: 110, duration: 1.1, stagger: 0.08 }, 0.8)
      .from('.hero-actions > *', { y: 40, scale: 0.85, duration: 1.1, stagger: 0.08 }, 0.95)

    if (introPlayed) {
      intro.progress(1)
    }
    else {
      introPlayed = true
      intro.play()
    }

    if (desktop) {
      // on the way out the lines drift apart, the copy lifts away and the drop floats up after it
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
        .to('.hero-line-1', { xPercent: -6, ease: 'none' }, 0)
        .to('.hero-line-2', { xPercent: 3, ease: 'none' }, 0)
        .to('.hero-line-3', { xPercent: 8, ease: 'none' }, 0)
        .to('.hero-copy', { yPercent: -18, ease: 'none' }, 0)
        .to('.hero-blob', { yPercent: -14, ease: 'none' }, 0)
    }
  }

  if (ui.isReady) {
    build()
    return
  }
  // wait for the preloader: fonts are final by then, so the lines split where they will stay
  const stop = watch(() => ui.isReady, (ready) => {
    if (!ready) return
    stop()
    context.add(build)
  })
  return stop
}, root, { deps: locale })
</script>

<template>
  <!--
    Full width, on the paper. The star is a drop of ferrofluid rendered in GLSL (FxFerrofluid): the
    pointer is its magnet — spikes rise towards it, a click knocks them flat. Signal is only the
    accent — the italic word, the live dot, the curve, and the warm reflection on the drop.
  -->
  <section
    ref="root"
    v-pause-offscreen
    class="hero relative overflow-hidden lg:flex lg:min-h-dvh lg:flex-col lg:justify-center"
  >
    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div class="hero-dots absolute inset-0" />
      <!-- hidden (display: none) below lg: never on screen there, so it never renders a frame -->
      <FxFerrofluid
        class="hero-blob absolute inset-0 hidden lg:block"
        :x="blob.x"
        :y="blob.y"
        :size="blob.size"
      />
    </div>

    <!-- the whole first screen on desktop: the drop needs the room, and the film starts on the next one -->
    <div class="hero-copy container-site relative pt-[calc(var(--header-h)+clamp(2rem,6vh,4.5rem))] pb-14 lg:pb-[clamp(3rem,8vh,6rem)]">
      <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <span class="hero-chip liquid-glass glass-on-light inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-semibold">
          <span class="ping-dot" />
          {{ t('hero.status') }}
        </span>
        <span class="hero-meta-text text-[0.9375rem] text-muted-foreground">{{ t('hero.role') }}</span>
        <span class="hero-meta-text hidden items-center gap-1.5 text-[0.9375rem] text-muted-foreground sm:inline-flex">
          · {{ t('site.city') }} <FxLiveClock class="font-semibold text-foreground" /> MSK
        </span>
      </div>

      <!-- narrower than the page on desktop (four lines): the drop lives in the space to the right of them -->
      <h1
        class="type-hero mt-[clamp(1.75rem,5vh,3.5rem)] lg:max-w-[66%] lg:text-[clamp(2.25rem,4.7vw,5.5rem)]"
        :aria-label="t('hero.title')"
      >
        <span
          class="hero-line hero-line-1"
          aria-hidden="true"
        >
          <span
            class="hero-seg"
            v-text="t('hero.line1')"
          />
          <FxEasingPill class="hero-pill" />
        </span>
        <span
          class="hero-line hero-line-2"
          aria-hidden="true"
        >
          <span
            class="hero-seg"
            v-text="t('hero.line2')"
          />
        </span>
        <span
          class="hero-line hero-line-3"
          aria-hidden="true"
        >
          <FxDotsPill class="hero-pill" />
          <span
            class="hero-seg"
            v-text="t('hero.line3')"
          />
          <span class="hero-accent inline-block -skew-x-12 text-signal">
            <FxRollingWord :word="t('hero.accent')" />
          </span>
        </span>
      </h1>

      <div class="mt-[clamp(2rem,5vh,4rem)] grid gap-10 lg:grid-cols-2 lg:gap-(--col-gap)">
        <div class="pb-2">
          <p
            class="hero-lead type-lead max-w-124 text-muted-foreground"
            v-text="t('hero.lead')"
          />
          <div class="hero-actions mt-8 flex flex-wrap gap-3">
            <FxMagnetic>
              <Button
                as="a"
                :href="withBase('/#projects')"
                variant="ink"
                size="pill"
                class="font-semibold"
                @click.prevent="scrollToSection('projects')"
              >
                {{ t('hero.projects') }}
              </Button>
            </FxMagnetic>
            <!-- wrapped: the intro tweens the wrapper, never an element with its own CSS transition -->
            <span class="inline-flex">
              <Button
                as="a"
                :href="withBase(site.resume)"
                target="_blank"
                variant="outline-ink"
                size="pill"
                class="font-semibold"
              >
                {{ t('hero.resume') }}
                <FxArrow />
              </Button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.26em;
  will-change: transform;
}

// a quiet dot grid, fading out towards the edges
.hero-dots {
  background-image: radial-gradient(circle, rgb(17 17 19 / 0.13) 1px, transparent 1.5px);
  background-size: 1.75rem 1.75rem;
  mask-image: radial-gradient(ellipse 70% 70% at 72% 40%, #000 10%, transparent 70%);

  @include dark {
    background-image: radial-gradient(circle, rgb(242 241 237 / 0.1) 1px, transparent 1.5px);
  }
}
</style>
