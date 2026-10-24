<script setup lang="ts">
import { gsap } from 'gsap'

// Same command structure (M + two C) so GSAP can morph between them point by point.
const curves = [
  'M8 38 C40 38 44 10 60 10 C76 10 80 38 112 38', // bell
  'M8 38 C52 38 54 38 60 24 C66 10 68 10 112 10', // ease-in-out
  'M8 38 C24 38 34 0 68 5 C92 8 100 10 112 10', // back.out — overshoot
]

const root = useTemplateRef<HTMLElement>('root')
const path = useTemplateRef<SVGPathElement>('path')
const dot = useTemplateRef<SVGCircleElement>('dot')

useGsap(({ reduceMotion }) => {
  const curve = path.value
  const marker = dot.value
  if (reduceMotion || !curve || !marker) return

  // an animation curve editor in a pill: the graph morphs between easings...
  const morph = gsap.timeline({ repeat: -1, defaults: { duration: 0.9, ease: 'power3.inOut' } })
  curves.forEach((_, index) => {
    morph.to(curve, { attr: { d: curves[(index + 1) % curves.length]! } }, '+=1.4')
  })

  // ...while the playhead dot rides along it
  const playhead = { t: 0 }
  const ride = gsap.to(playhead, {
    t: 1,
    duration: 1.7,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    onUpdate: () => {
      const point = curve.getPointAtLength(playhead.t * curve.getTotalLength())
      marker.setAttribute('cx', String(point.x))
      marker.setAttribute('cy', String(point.y))
    },
  })

  // path measuring every frame is not free: run only while the pill is on screen
  whileOnScreen(root.value!, (onScreen) => {
    morph.paused(!onScreen)
    ride.paused(!onScreen)
  })
}, root)
</script>

<template>
  <span
    ref="root"
    class="easing-pill"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 120 48"
      fill="none"
    >
      <path
        ref="path"
        d="M8 38 C40 38 44 10 60 10 C76 10 80 38 112 38"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
      />
      <circle
        ref="dot"
        cx="60"
        cy="10"
        r="5.5"
        class="fill-paper"
      />
    </svg>
  </span>
</template>

<style scoped>
.easing-pill {
  display: inline-flex;
  width: 2.3em;
  height: 0.86em;
  padding: 0.06em 0.16em;
  vertical-align: -0.02em;
  border-radius: 999px;
  background: var(--color-ink);
  color: var(--color-signal);
}

/* a step lighter than the dark page, so the pill still reads as a shape */
:global(.dark) .easing-pill {
  background: #2c2c30;
}

.easing-pill svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
