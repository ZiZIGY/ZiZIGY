<script setup lang="ts">
import { ArrowUp } from '@lucide/vue'
import { gsap } from 'gsap'

/*
 * "Back to top": a plain glass button bottom right, once you're a screen down the page.
 * It rises out of the edge with a little stretch and sinks back when you return to the top.
 */
const { t } = useI18n()
const ui = useUiStore()
const { scrollToTop } = useSectionNav()
const reducedMotion = usePreferredReducedMotion()
const mounted = useMounted()

const root = useTemplateRef<HTMLElement>('root')
const body = useTemplateRef<HTMLElement>('body')
const arrow = useTemplateRef<HTMLElement>('arrow')

const scrolledDown = ref(false)
const shown = computed(() => mounted.value && scrolledDown.value && !ui.isMenuOpen && !ui.immersive)

useLenis((lenis) => {
  if (mounted.value) scrolledDown.value = lenis.scroll > innerHeight * 0.9
})

// in: rises out of the edge, stretched, and settles with a wobble; out: sinks back
watch(shown, (visible) => {
  const el = root.value
  if (!el) return
  if (reducedMotion.value === 'reduce') {
    gsap.set(el, { autoAlpha: visible ? 1 : 0 })
    return
  }
  gsap.killTweensOf([el, body.value])
  if (visible) {
    gsap.timeline()
      .set(el, { autoAlpha: 1 })
      .fromTo(body.value, { y: 110, scaleY: 1.5, scaleX: 0.75 }, { y: 0, scaleY: 1, scaleX: 1, duration: 1.1, ease: 'elastic.out(1, 0.5)' })
  }
  else {
    gsap.timeline()
      .to(body.value, { y: 110, scaleY: 1.3, scaleX: 0.85, duration: 0.45, ease: 'power3.in' })
      .set(el, { autoAlpha: 0 })
  }
})

function onClick() {
  if (reducedMotion.value !== 'reduce') {
    // the arrow shoots off the top and comes back in from below
    gsap.timeline()
      .to(arrow.value, { yPercent: -160, duration: 0.3, ease: 'power3.in' })
      .set(arrow.value, { yPercent: 160 })
      .to(arrow.value, { yPercent: 0, duration: 0.6, ease: 'expo.out' })
  }
  scrollToTop()
}
</script>

<template>
  <div
    ref="root"
    class="to-top"
    :class="{ 'is-shown': shown }"
  >
    <!-- the wrapper takes the entrance; the glass button inside keeps its own hover transition -->
    <div
      ref="body"
      class="size-full origin-bottom"
    >
      <button
        type="button"
        class="liquid-glass glass-refract glass-ink grid size-full place-items-center rounded-full"
        :aria-label="t('footer.top')"
        :tabindex="shown ? 0 : -1"
        data-cursor="stick"
        @click="onClick"
      >
        <span class="grid h-5 overflow-hidden">
          <span
            ref="arrow"
            class="grid"
          >
            <ArrowUp class="size-5" />
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.to-top {
  position: fixed;
  right: var(--gutter);
  bottom: var(--gutter);
  z-index: 45;
  width: 3.5rem;
  height: 3.5rem;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.to-top.is-shown {
  pointer-events: auto;
}
</style>
