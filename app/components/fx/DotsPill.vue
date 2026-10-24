<script setup lang="ts">
import { gsap } from 'gsap'

const colors = ['var(--color-signal)', 'var(--foreground)', 'var(--color-graphite)']

const root = useTemplateRef<HTMLElement>('root')

useGsap(({ reduceMotion }, context) => {
  const el = root.value
  if (reduceMotion || !el) return

  const dots = gsap.utils.toArray<HTMLElement>('.dot', el)
  // slots[i] = position of dot i
  const slots = dots.map((_, index) => index)

  const swap = context.add('swap', () => {
    const left = Math.random() < 0.5 ? 0 : 1
    const a = slots.indexOf(left)
    const b = slots.indexOf(left + 1)
    slots[a] = left + 1
    slots[b] = left

    gsap.to(dots[a]!, { '--slot': left + 1, 'duration': 0.7, 'ease': 'power3.inOut' })
    gsap.to(dots[b]!, { '--slot': left, 'duration': 0.7, 'ease': 'power3.inOut' })
    gsap.to(dots[a]!, { yPercent: -55, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 })
    gsap.to(dots[b]!, { yPercent: 35, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 })
  }) as () => void

  const loop = gsap.timeline({ repeat: -1 }).call(swap, [], 1.8)
  whileOnScreen(el, onScreen => loop.paused(!onScreen))

  const hop = context.add('hop', () => {
    gsap.to(dots, { keyframes: { yPercent: [0, -60, 0] }, duration: 0.5, stagger: 0.07, ease: 'power2.out', overwrite: 'auto' })
  }) as () => void
  el.addEventListener('pointerenter', hop)
  return () => el.removeEventListener('pointerenter', hop)
}, root)
</script>

<template>
  <span
    ref="root"
    class="dots-pill"
    aria-hidden="true"
  >
    <span
      v-for="(color, index) in colors"
      :key="color"
      class="dot"
      :style="{ '--slot': index, 'background': color }"
    />
  </span>
</template>

<style scoped>
.dots-pill {
  position: relative;
  display: inline-block;
  width: 2.4em;
  height: 0.86em;
  vertical-align: -0.02em;
  border-radius: 999px;
  background: var(--secondary);
}

.dot {
  --size: 0.6em;
  --gap: 0.12em;
  position: absolute;
  top: calc((0.86em - var(--size)) / 2);
  left: calc(0.15em + var(--slot) * (var(--size) + var(--gap)));
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
}
</style>
