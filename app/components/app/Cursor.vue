<script setup lang="ts">
import { gsap } from 'gsap'

/*
 * The site's only cursor (the system one is hidden while this is on screen). Every hover reaction
 * lives here instead of in the components:
 *   idle    dot + trailing ring, and a ribbon trail that swells with speed like a brush stroke
 *   link    plain links: the ring swells into a disc that inverts what's under it
 *   stick   buttons, pills, tabs, tiles: the ring wraps the element, matching its size and radius
 *   label   [data-cursor="view|drag|copy|play"]: a signal bubble with a word ([data-cursor-label] overrides it)
 *   lens    [data-cursor="lens"]: a liquid-glass magnifier ([data-cursor-tone="light|dark"])
 *   none    [data-cursor="none"]: only the dot, for elements that react to the pointer themselves
 * and every click sends a ripple out of the pointer.
 * Positions are written straight to the DOM from GSAP's ticker; Vue only switches the state classes.
 */
type CursorState = 'idle' | 'link' | 'stick' | 'label' | 'lens' | 'none'
interface Point { x: number, y: number }

const STICK = '[data-slot="button"], [data-cursor="stick"], header nav a, header button, .social'
const TARGETS = `[data-cursor], ${STICK}, a, button, [role="button"], label, summary`
const TRAIL = 20
const RIPPLE_MS = 650

const { t } = useI18n()
const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
const reducedMotion = usePreferredReducedMotion()
const enabled = computed(() => canHover.value && reducedMotion.value !== 'reduce')

const dot = useTemplateRef<HTMLElement>('dot')
const ring = useTemplateRef<HTMLElement>('ring')
const shape = useTemplateRef<HTMLElement>('shape')
const lens = useTemplateRef<HTMLElement>('lens')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

const state = ref<CursorState>('idle')
const label = ref('')
const lensTone = ref<'dark' | 'light'>('dark')
const visible = ref(false)
const pressed = ref(false)

// per-frame values stay out of Vue's reactivity, and nothing is allocated per frame
const point = (): Point => ({ x: 0, y: 0 })
const pointer = point()
const ringAt = point()
const chain = Array.from({ length: TRAIL }, point)
const left = Array.from({ length: TRAIL }, point)
const right = Array.from({ length: TRAIL }, point)
const ripples: Array<Point & { age: number }> = []
let stuck: HTMLElement | null = null
let stuckW = 0
let stuckH = 0
let hovered: HTMLElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let painted = false

// hide the system cursor only while ours is actually on screen
watchEffect(() => {
  document.documentElement.classList.toggle('has-cursor', enabled.value && visible.value)
})

// frame-rate independent lerp factor: `base` is the share covered per 60 fps frame
const ease = (base: number, dt: number) => 1 - (1 - base) ** (dt / 16.67)

function resize() {
  const el = canvas.value
  if (!el) return
  const ratio = Math.min(devicePixelRatio || 1, 2)
  width = innerWidth
  height = innerHeight
  el.width = Math.round(width * ratio)
  el.height = Math.round(height * ratio)
  ctx = el.getContext('2d')
  ctx?.setTransform(ratio, 0, 0, ratio, 0, 0)
  painted = false
}

// ——— hover targets ———

function classify(target: HTMLElement | null) {
  hovered = target
  stuck = null
  stuckW = stuckH = 0
  shape.value?.removeAttribute('style')
  if (!target) {
    state.value = 'idle'
    return
  }
  const kind = target.dataset.cursor
  if (kind === 'none') {
    state.value = 'none'
  }
  else if (kind === 'lens') {
    lensTone.value = target.dataset.cursorTone === 'light' ? 'light' : 'dark'
    state.value = 'lens'
  }
  else if (kind && kind !== 'stick') {
    label.value = target.dataset.cursorLabel ?? t(`cursor.${kind}`)
    state.value = 'label'
  }
  else if (target.matches(STICK)) {
    stuck = target
    if (shape.value) shape.value.style.borderRadius = getComputedStyle(target).borderRadius
    state.value = 'stick'
  }
  else {
    state.value = 'link'
  }
}

// ——— the frame loop ———

// the ring eases to the pointer — or to the centre of the element it wraps, pulled a little by the pointer
function moveRing(dt: number) {
  let tx = pointer.x
  let ty = pointer.y
  if (stuck) {
    const rect = stuck.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    // the element scrolled away from under the pointer: let go
    if (pointer.x < rect.left - 40 || pointer.x > rect.right + 40 || pointer.y < rect.top - 40 || pointer.y > rect.bottom + 40) {
      classify(null)
    }
    else {
      tx = cx + (pointer.x - cx) * 0.12
      ty = cy + (pointer.y - cy) * 0.12
      if (Math.abs(rect.width - stuckW) > 0.5 || Math.abs(rect.height - stuckH) > 0.5) {
        stuckW = rect.width
        stuckH = rect.height
        const s = shape.value!.style
        s.width = `${stuckW + 12}px`
        s.height = `${stuckH + 12}px`
        s.margin = `${-(stuckH + 12) / 2}px 0 0 ${-(stuckW + 12) / 2}px`
      }
    }
  }
  const k = ease(stuck ? 0.28 : 0.2, dt)
  const dx = tx - ringAt.x
  const dy = ty - ringAt.y
  if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return
  ringAt.x += dx * k
  ringAt.y += dy * k
  const at = `translate3d(${ringAt.x}px, ${ringAt.y}px, 0)`
  ring.value!.style.transform = at
  lens.value!.style.transform = at
}

// each link of the trail chases the one ahead of it, which bends the ribbon into smooth curves
function moveTrail(dt: number) {
  chain[0]!.x = pointer.x
  chain[0]!.y = pointer.y
  const k = ease(0.55, dt)
  for (let i = 1; i < TRAIL; i++) {
    const a = chain[i - 1]!
    const b = chain[i]!
    b.x += (a.x - b.x) * k
    b.y += (a.y - b.y) * k
  }
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i]!.age += dt / RIPPLE_MS
    if (ripples[i]!.age >= 1) ripples.splice(i, 1)
  }
}

// continues the current path through the points, smoothed by bending through their midpoints
function curve(c: CanvasRenderingContext2D, points: Point[], reverse: boolean) {
  const at = (i: number) => points[reverse ? TRAIL - 1 - i : i]!
  for (let i = 1; i < TRAIL - 1; i++) {
    const p = at(i)
    const q = at(i + 1)
    c.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2)
  }
  c.lineTo(at(TRAIL - 1).x, at(TRAIL - 1).y)
}

function draw() {
  const c = ctx
  const el = canvas.value
  if (!c || !el) return
  const head = chain[0]!
  const tail = chain[TRAIL - 1]!
  // settled: clear once and hide the layer, so a still pointer costs nothing (scrolling included)
  if (Math.abs(head.x - tail.x) + Math.abs(head.y - tail.y) < 1 && !ripples.length) {
    if (painted) {
      c.clearRect(0, 0, width, height)
      el.style.visibility = 'hidden'
      painted = false
    }
    return
  }
  if (!painted) {
    el.style.visibility = 'visible'
    painted = true
  }
  c.clearRect(0, 0, width, height)
  c.fillStyle = '#fff'
  c.strokeStyle = '#fff'

  // the ribbon is one filled shape — its two edges offset along the normals. Like a brush stroke it is
  // wide where the links are stretched apart (fast) and thin where they bunch up, tapering to the tail
  let headHalf = 0
  for (let i = 0; i < TRAIL; i++) {
    const p = chain[i]!
    const prev = chain[Math.max(0, i - 1)]!
    const next = chain[Math.min(TRAIL - 1, i + 1)]!
    const nx = next.y - prev.y
    const ny = prev.x - next.x
    const half = Math.min(7, 0.6 + Math.hypot(next.x - p.x, next.y - p.y) * 0.45) * (1 - i / (TRAIL - 1)) ** 1.1
    if (!i) headHalf = half
    const w = half / (Math.hypot(nx, ny) || 1)
    left[i]!.x = p.x + nx * w
    left[i]!.y = p.y + ny * w
    right[i]!.x = p.x - nx * w
    right[i]!.y = p.y - ny * w
  }
  c.beginPath()
  c.moveTo(left[0]!.x, left[0]!.y)
  curve(c, left, false)
  curve(c, right, true)
  c.closePath()
  c.fill()
  c.beginPath()
  c.arc(head.x, head.y, headHalf, 0, Math.PI * 2)
  c.fill()

  c.lineWidth = 1.5
  for (const ripple of ripples) {
    c.globalAlpha = 1 - ripple.age
    c.beginPath()
    c.arc(ripple.x, ripple.y, 6 + (1 - (1 - ripple.age) ** 3) * 46, 0, Math.PI * 2)
    c.stroke()
  }
  c.globalAlpha = 1
}

function tick(_time: number, dt: number) {
  if (!visible.value) return
  // what was under the pointer left the page without the pointer moving (the demo poster is swapped
  // for its frame on click): look again at what is there now, which may be an iframe
  if (hovered && !hovered.isConnected) onElement(document.elementFromPoint(pointer.x, pointer.y))
  if (!visible.value) return
  moveRing(dt)
  moveTrail(dt)
  draw()
}

// ——— input ———

function onMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  const { clientX: x, clientY: y } = event
  if (!visible.value) {
    // first move: start everything at the pointer instead of flying in from a corner
    for (const p of [pointer, ringAt, ...chain]) {
      p.x = x
      p.y = y
    }
    visible.value = true
  }
  pointer.x = x
  pointer.y = y
  if (dot.value) dot.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
}

function hide() {
  visible.value = false
  classify(null)
}

// an explicit [data-cursor] wins over the plain buttons and links inside it (the showreel's play button)
function onElement(el: Element | null) {
  // an embedded demo gets its own document's cursor: this page stops receiving moves at the frame's edge
  if (el?.tagName === 'IFRAME') return hide()
  const target = el?.closest<HTMLElement>('[data-cursor]') ?? el?.closest<HTMLElement>(TARGETS) ?? null
  if (target !== hovered) classify(target)
}

function onOver(event: PointerEvent) {
  onElement(event.target as Element | null)
}

function onDown(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  pressed.value = true
  ripples.push({ x: event.clientX, y: event.clientY, age: 0 })
}

// a click can flip a label (Play → Pause): read it again once Vue has re-rendered
function onUp() {
  pressed.value = false
  setTimeout(() => {
    if (state.value === 'label' && hovered?.dataset.cursorLabel) label.value = hovered.dataset.cursorLabel
  })
}

watch(canvas, el => el && resize(), { flush: 'post' })

onMounted(() => gsap.ticker.add(tick))

onBeforeUnmount(() => {
  gsap.ticker.remove(tick)
  document.documentElement.classList.remove('has-cursor')
})

useEventListener(window, 'pointermove', onMove, { passive: true })
useEventListener(window, 'resize', resize, { passive: true })
useEventListener(document, 'pointerover', onOver, { passive: true })
useEventListener(document, 'pointerdown', onDown, { passive: true })
useEventListener(document, 'pointerup', onUp, { passive: true })
useEventListener(document.documentElement, 'pointerleave', hide)
// a click into an embedded demo moves the focus into its document: from then on the pointer is its
// business, until it comes back out over this page and moves here again
useEventListener(window, 'blur', hide)
</script>

<template>
  <div
    v-if="enabled"
    class="cursor"
    :class="[`is-${state}`, { 'is-visible': visible, 'is-pressed': pressed }]"
    aria-hidden="true"
  >
    <canvas
      ref="canvas"
      class="cursor-trail"
    />

    <!-- no blend mode on the lens' box: a blended parent would cut the glass off from the page -->
    <div
      ref="lens"
      class="cursor-pos"
    >
      <div
        class="cursor-lens liquid-glass glass-lens glass-gloss"
        :class="lensTone === 'light' ? 'glass-on-light' : 'glass-on-dark'"
      />
    </div>

    <div
      ref="ring"
      class="cursor-pos is-blend is-ring"
    >
      <div
        ref="shape"
        class="cursor-ring"
      >
        <span class="cursor-bubble">
          <span class="cursor-label">{{ label }}</span>
        </span>
      </div>
    </div>

    <div
      ref="dot"
      class="cursor-pos is-blend"
    >
      <div class="cursor-dot" />
    </div>
  </div>
</template>

<style scoped>
.cursor {
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.cursor.is-visible {
  opacity: 1;
}

/* a full-screen blended layer, so it is only shown while there is a trail on it (see draw()) */
.cursor-trail {
  position: fixed;
  inset: 0;
  z-index: 94;
  width: 100vw;
  height: 100vh;
  mix-blend-mode: difference;
  visibility: hidden;
}

/* positioned from script; the blend mode sits on the moving box, which is what meets the page */
.cursor-pos {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 95;
  will-change: transform;
}

.cursor-pos.is-blend {
  mix-blend-mode: difference;
}

.cursor-dot,
.cursor-ring {
  border-radius: 50%;
}

.cursor-dot {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  background: #fff;
  transition: opacity 0.2s, scale 0.3s var(--ease-out-expo);
}

.cursor-ring {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  margin: -1.25rem 0 0 -1.25rem;
  border: 1px solid #fff;
  transition:
    width 0.4s var(--ease-out-expo),
    height 0.4s var(--ease-out-expo),
    margin 0.4s var(--ease-out-expo),
    border-radius 0.4s var(--ease-out-expo),
    scale 0.5s var(--ease-out-expo),
    background-color 0.3s,
    border-color 0.3s;
}

.cursor-bubble {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  place-items: center;
  width: 6.5rem;
  height: 6.5rem;
  margin: -3.25rem 0 0 -3.25rem;
  border-radius: 50%;
  background: var(--color-signal);
  /* a paper rim keeps the bubble apart from signal surfaces (the accent cards, the hero) */
  box-shadow: 0 0 0 0.2rem var(--color-paper), 0 0.75rem 1.5rem -0.5rem rgb(17 17 19 / 0.35);
  scale: 0;
  transition: scale 0.5s var(--ease-out-expo);
}

/* one or two short words, centred in the bubble (the labels are kept short: Смотреть, Далее, Тащи) */
.cursor-label {
  max-width: 5.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.15;
  text-align: center;
  text-wrap: balance;
  color: var(--color-ink);
}

/* hidden, not only scaled away, so its backdrop filter isn't computed while unused */
.cursor-lens {
  width: 8rem;
  height: 8rem;
  margin: -4rem 0 0 -4rem;
  border-radius: 50%;
  scale: 0;
  visibility: hidden;
  transition: scale 0.4s var(--ease-out-expo), visibility 0s 0.4s;
}

/* link: the ring swells into a disc that inverts whatever is under it */
.is-link .cursor-ring {
  scale: 1.6;
  background: #fff;
}

.is-link .cursor-dot {
  opacity: 0;
}

/* stick: the ring is resized and rounded from script to wrap the hovered element */
.is-stick .cursor-ring {
  border-width: 1.5px;
  background: rgb(255 255 255 / 0.06);
}

/* label: the signal bubble must stay signal, not get inverted against the page */
.is-label .cursor-ring {
  border-color: transparent;
}

.is-label .cursor-pos.is-ring {
  mix-blend-mode: normal;
}

.is-label .cursor-bubble {
  scale: 1;
}

.is-label .cursor-dot {
  opacity: 0;
}

/* lens: the ring steps aside for the magnifier, the dot stays as the exact point */
.is-lens .cursor-ring,
.is-none .cursor-ring {
  scale: 0;
}

.is-lens .cursor-lens {
  scale: 1;
  visibility: visible;
  transition: scale 0.5s var(--ease-spring), visibility 0s;
}

.is-pressed .cursor-ring {
  scale: 0.82;
}

.is-pressed.is-link .cursor-ring {
  scale: 1.35;
}

.is-pressed.is-stick .cursor-ring {
  scale: 0.95;
}

/* a hidden ring stays hidden through a click */
.is-pressed.is-lens .cursor-ring,
.is-pressed.is-none .cursor-ring {
  scale: 0;
}

.is-pressed .cursor-dot {
  scale: 0.6;
}
</style>
