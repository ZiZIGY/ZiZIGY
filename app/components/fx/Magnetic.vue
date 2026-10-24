<script setup lang="ts">
import { gsap } from 'gsap'

const props = withDefaults(defineProps<{
  /** Share of the pointer offset the element follows. */
  strength?: number
}>(), { strength: 0.3 })

const root = useTemplateRef<HTMLElement>('root')
const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
const reducedMotion = usePreferredReducedMotion()
const enabled = computed(() => canHover.value && reducedMotion.value !== 'reduce')

function onMove(event: PointerEvent) {
  const el = root.value
  if (!enabled.value || !el) return

  // measure the resting box: the rect already includes the current pull
  const rect = el.getBoundingClientRect()
  const cx = rect.left - Number(gsap.getProperty(el, 'x')) + rect.width / 2
  const cy = rect.top - Number(gsap.getProperty(el, 'y')) + rect.height / 2

  gsap.to(el, {
    x: (event.clientX - cx) * props.strength,
    y: (event.clientY - cy) * props.strength,
    duration: 0.6,
    ease: 'power3.out',
    overwrite: true,
  })
}

function onLeave() {
  if (!root.value) return
  gsap.to(root.value, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)', overwrite: true })
}
</script>

<template>
  <span
    ref="root"
    class="magnetic relative isolate inline-flex"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <slot />
  </span>
</template>

<style scoped>
/* a slightly larger hit area, so the pull starts before the pointer reaches the button */
.magnetic::before {
  content: "";
  position: absolute;
  inset: -0.875rem;
  z-index: -1;
}
</style>
