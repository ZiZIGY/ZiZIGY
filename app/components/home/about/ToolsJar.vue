<script setup lang="ts">
import { gsap } from 'gsap'
import Matter from 'matter-js'
import { site } from '~/data/site'

const { t } = useI18n()

const jar = useTemplateRef<HTMLElement>('jar')
const chips = useTemplateRef<HTMLElement[]>('chips')
const live = ref(false)
const visible = useElementVisibility(jar)
const reducedMotion = usePreferredReducedMotion()
const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')

let engine: Matter.Engine | undefined
let bodies: Matter.Body[] = []
let sizes: { w: number, h: number }[] = []
let mouse: Matter.Mouse | undefined
let started = false

function build() {
  const el = jar.value
  if (!el || !chips.value?.length) return
  const { Bodies, Composite, Engine, Mouse, MouseConstraint } = Matter
  const width = el.clientWidth
  const height = el.clientHeight
  const wall = 200

  engine = Engine.create({ gravity: { x: 0, y: 1.1 } })
  const walls = [
    Bodies.rectangle(width / 2, height + wall / 2, width + wall * 2, wall, { isStatic: true }),
    Bodies.rectangle(-wall / 2, height / 2, wall, height * 4, { isStatic: true }),
    Bodies.rectangle(width + wall / 2, height / 2, wall, height * 4, { isStatic: true }),
    Bodies.rectangle(width / 2, -height * 1.5 - wall / 2, width + wall * 2, wall, { isStatic: true }),
  ]

  bodies = sizes.map(({ w, h }, index) => Bodies.rectangle(
    gsap.utils.random(w / 2 + 4, Math.max(w / 2 + 5, width - w / 2 - 4)),
    -h - index * 22,
    w,
    h,
    { chamfer: { radius: h / 2 }, restitution: 0.3, friction: 0.25, frictionAir: 0.012, density: 0.002, angle: gsap.utils.random(-0.4, 0.4) },
  ))
  Composite.add(engine.world, [...walls, ...bodies])

  if (canHover.value) {
    mouse = Mouse.create(el)
    // matter-js swallows the wheel over its element: give the page its scroll back
    el.removeEventListener('wheel', (mouse as unknown as { mousewheel: EventListener }).mousewheel)
    el.removeEventListener('mousewheel', (mouse as unknown as { mousewheel: EventListener }).mousewheel)
    el.removeEventListener('DOMMouseScroll', (mouse as unknown as { mousewheel: EventListener }).mousewheel)
    Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } } }))
  }
}

function measure() {
  sizes = (chips.value ?? []).map(chip => ({ w: chip.offsetWidth, h: chip.offsetHeight }))
}

function sync() {
  chips.value?.forEach((chip, index) => {
    const body = bodies[index]
    const size = sizes[index]
    if (!body || !size) return
    chip.style.transform = `translate(${body.position.x - size.w / 2}px, ${body.position.y - size.h / 2}px) rotate(${body.angle}rad)`
  })
}

function tick(_time: number, deltaMs: number) {
  if (!engine || !visible.value) return
  const step = Math.min(deltaMs, 33)
  if (step > 16.67) {
    Matter.Engine.update(engine, step / 2)
    Matter.Engine.update(engine, step / 2)
  }
  else {
    Matter.Engine.update(engine, step)
  }
  sync()
}

// a fast scroll makes the chips hop
useLenis((lenis) => {
  if (!engine || !visible.value || Math.abs(lenis.velocity) < 18) return
  const kick = Math.min(Math.abs(lenis.velocity) / 9, 9)
  for (const body of bodies) {
    if (Math.random() < 0.5) continue
    Matter.Body.setVelocity(body, { x: body.velocity.x + gsap.utils.random(-1.5, 1.5), y: body.velocity.y - kick })
  }
})

function shake() {
  if (!engine || canHover.value) return
  for (const body of bodies) Matter.Body.setVelocity(body, { x: gsap.utils.random(-6, 6), y: gsap.utils.random(-14, -6) })
}

// start once the jar is first seen: the chips fall in then, not off screen
watch(visible, (now) => {
  if (!now || started || reducedMotion.value === 'reduce') return
  started = true
  measure()
  live.value = true
  nextTick(() => {
    build()
    gsap.ticker.add(tick)
  })
})

useResizeObserver(jar, () => {
  if (!started || !engine) return
  // rebuild the walls for the new width; the chips rain in again
  Matter.Engine.clear(engine)
  build()
})

onBeforeUnmount(() => {
  gsap.ticker.remove(tick)
  if (engine) Matter.Engine.clear(engine)
  if (mouse) Matter.Mouse.clearSourceEvents(mouse)
})
</script>

<template>
  <div>
    <p class="text-sm font-semibold">
      {{ t('about.jar') }}
    </p>
    <div
      ref="jar"
      class="jar"
      :class="{ 'is-live': live }"
      @pointerdown="shake"
    >
      <span
        v-for="tool in site.tools"
        ref="chips"
        :key="tool"
        class="jar-chip"
        data-cursor="drag"
      >{{ tool }}</span>
    </div>
  </div>
</template>

<style scoped>
.jar {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0.5rem;
  height: 15rem;
  margin-top: 1rem;
  padding: 0.75rem;
  overflow: hidden;
  border-radius: var(--radius-tile);
  box-shadow: inset 0 0 0 1px var(--border);
  background: color-mix(in srgb, var(--foreground) 3%, transparent);
  user-select: none;
}

.jar-chip {
  padding: 0.5rem 1rem;
  border-radius: 99px;
  background: var(--card);
  box-shadow: inset 0 0 0 1px var(--border), 0 0.4rem 0.8rem -0.5rem rgb(17 17 19 / 0.3);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: grab;
}

/* the simulation owns the positions: every chip is placed by transform from the jar's corner */
.jar.is-live .jar-chip {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
  transform: translate(-200%, -200%);
}

.jar-chip:nth-child(4n + 1) {
  background: var(--color-ink);
  color: var(--color-paper);
}

.jar-chip:nth-child(7n + 3) {
  background: var(--color-signal);
  color: var(--color-ink);
  box-shadow: none;
}
</style>
