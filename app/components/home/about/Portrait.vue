<script setup lang="ts">
import { gsap } from 'gsap'

const props = defineProps<{ chapter: number }>()

const { t } = useI18n()

const frame = useTemplateRef<HTMLElement>('frame')
const readout = useTemplateRef<HTMLElement>('readout')
const penPath = useTemplateRef<SVGPathElement>('penPath')
const motionPath = useTemplateRef<SVGPathElement>('motionPath')
const ball = useTemplateRef<SVGCircleElement>('ball')

const expo = gsap.parseEase('expo.out')
const back = gsap.parseEase('back.out(1.7)')
const clamp = gsap.utils.clamp(0, 1)
const span = (value: number, from: number, to: number) => clamp((value - from) / (to - from))
const smooth = (k: number) => k * k * (3 - 2 * k)

const layers = ['shared', 'entities', 'features', 'widgets', 'pages', 'app']

const PEN = 'M715 520 C720.3 530 736.2 560 747 580 C757.8 600 769.5 610 780 640 C790.5 670 803.2 720 810 760 C816.8 800 819 840 821 880 C823 920 827.5 965 822 1000 C816.5 1035 793.7 1075 788 1090'
const anchors = [[715, 520, 0], [747, 580, 0.114], [780, 640, 0.229], [810, 760, 0.436], [821, 880, 0.638], [822, 1000, 0.839], [788, 1090, 1]] as const
const handles = [
  { at: [810, 760], a: [803.2, 720], b: [816.8, 800], f: 0.436 },
  { at: [822, 1000], a: [827.5, 965], b: [816.5, 1035], f: 0.839 },
] as const
const SAMPLE = { x: 450, y: 700, hex: '#BCAFA2' }
const swatches = [
  { id: 'hair', hex: '#48342A' },
  { id: 'skin', hex: '#B58572' },
  { id: 'hoodie', hex: '#BCAFA2' },
  { id: 'wall', hex: '#B8B4AF' },
] as const

const MOTION = 'M90 940 C60 420 300 40 560 50 S900 220 900 420'
const tracks = [
  { id: 'ball', prop: 'motionPath · expo.out', from: 0, to: 1 },
  { id: 'ring', prop: 'scale · back.out', from: 0.25, to: 0.7 },
  { id: 'tag', prop: 'opacity', from: 0.55, to: 1 },
]
const ghosts = ref<{ x: number, y: number, at: number }[]>([])
let motionLength = 0
let penLength = 0

const pct = (x: number, y: number): [number, number] => [x / 10.24, y / 15.36]
const mix = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]

function cursorAt(p: number): [number, number] {
  if (p < 0.62) {
    const k = span(p, 0.38, 0.62)
    return [32.5 + 41.5 * k, 5.5 + 27 * k]
  }
  if (p < 0.75) return mix([74, 32.5], pct(715, 520), smooth(span(p, 0.62, 0.75)))
  if (p < 0.88 && penPath.value && penLength) {
    const tip = penPath.value.getPointAtLength(span(p, 0.75, 0.88) * penLength)
    return pct(tip.x, tip.y)
  }
  if (p < 0.91) return mix(pct(788, 1090), pct(SAMPLE.x, SAMPLE.y), smooth(span(p, 0.88, 0.91)))
  return pct(SAMPLE.x, SAMPLE.y)
}

function setProgress(value: number) {
  const el = frame.value
  if (!el) return
  const design = clamp(value)
  const motion = clamp(value - 2)
  const eased = expo(motion)
  const [cx, cy] = cursorAt(design)
  const vars: Record<string, number> = {
    '--c': value,
    '--e': eased,
    '--sel': span(design, 0.38, 0.62),
    '--pen': span(design, 0.75, 0.88),
    '--drop': back(span(design, 0.9, 0.96)),
    '--styles': span(design, 0.86, 1),
    '--cx': cx,
    '--cy': cy,
    '--b': back(span(motion, 0.25, 0.7)),
    '--tag': span(motion, 0.55, 1),
  }
  for (const [name, v] of Object.entries(vars)) el.style.setProperty(name, v.toFixed(4))
  if (readout.value) readout.value.textContent = `${(motion * 1.2).toFixed(2)}s`
  if (ball.value && motionPath.value && motionLength) {
    const point = motionPath.value.getPointAtLength(eased * motionLength)
    ball.value.setAttribute('cx', point.x.toFixed(1))
    ball.value.setAttribute('cy', point.y.toFixed(1))
  }
}

onMounted(() => {
  penLength = penPath.value?.getTotalLength() ?? 0
  const path = motionPath.value
  if (!path) return
  motionLength = path.getTotalLength()
  ghosts.value = Array.from({ length: 11 }, (_, i) => {
    const at = expo(i / 10)
    const point = path.getPointAtLength(at * motionLength)
    return { x: point.x, y: point.y, at }
  })
})

defineExpose({ setProgress })

const pad = (value: number) => String(value).padStart(2, '0')

const caption = useTemplateRef<HTMLElement>('caption')
const reducedMotion = usePreferredReducedMotion()
let turn = 1
watch(() => props.chapter, (now, before) => {
  turn = now > before ? 1 : -1
})

function captionLeave(el: Element, done: () => void) {
  const box = caption.value
  if (!box || reducedMotion.value === 'reduce') return done()
  gsap.killTweensOf(box)
  box.style.width = `${box.offsetWidth}px`
  gsap.to(el, { yPercent: -120 * turn, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: done })
}

function captionEnter(el: Element, done: () => void) {
  const box = caption.value
  if (!box || reducedMotion.value === 'reduce') return done()
  const from = box.offsetWidth
  box.style.width = ''
  const to = box.offsetWidth
  gsap.fromTo(box, { width: from }, { width: to, duration: 0.55, ease: 'expo.out', clearProps: 'width' })
  gsap.fromTo(el, { yPercent: 120 * turn, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: 'expo.out', onComplete: done })
}
</script>

<template>
  <div
    ref="frame"
    class="portrait"
  >
    <div class="layer is-print">
      <HomeAboutPicture
        name="me"
        :alt="t('about.photoAlt')"
      />
    </div>

    <div
      class="layer is-sketch"
      aria-hidden="true"
    >
      <span class="grid"><i
        v-for="column in 4"
        :key="column"
      /></span>
      <HomeAboutPicture
        name="me-sketch"
        class="sketch"
      />
    </div>
    <span
      class="scan"
      aria-hidden="true"
    />

    <div
      class="layer is-color"
      aria-hidden="true"
    >
      <HomeAboutPicture name="me" />
    </div>

    <div
      class="picture-box is-design"
      aria-hidden="true"
    >
      <svg
        class="vectors"
        viewBox="0 0 1024 1536"
      >
        <path
          ref="penPath"
          class="pen"
          :d="PEN"
          pathLength="1"
        />
        <g
          v-for="handle in handles"
          :key="handle.f"
          class="pen-handle"
          :style="{ '--f': handle.f }"
        >
          <line
            :x1="handle.a[0]"
            :y1="handle.a[1]"
            :x2="handle.b[0]"
            :y2="handle.b[1]"
          />
          <circle
            :cx="handle.a[0]"
            :cy="handle.a[1]"
            r="6"
          />
          <circle
            :cx="handle.b[0]"
            :cy="handle.b[1]"
            r="6"
          />
        </g>
        <rect
          v-for="[x, y, f] in anchors"
          :key="f"
          class="pen-anchor"
          :style="{ '--f': f }"
          :x="x - 8"
          :y="y - 8"
          width="16"
          height="16"
        />
      </svg>

      <span class="measure"><b>84</b></span>
      <span class="select">
        <i /><i /><i /><i />
        <b>425 × 415</b>
      </span>
      <span
        class="dropper"
        :style="{ left: `${SAMPLE.x / 10.24}%`, top: `${SAMPLE.y / 15.36}%` }"
      >
        <i
          class="dropper-loupe"
          :style="{ background: SAMPLE.hex }"
        />
        <b>{{ SAMPLE.hex }}</b>
      </span>

      <span class="styles">
        <b class="styles-title">{{ t('about.portrait.styles') }}</b>
        <span
          v-for="(swatch, index) in swatches"
          :key="swatch.id"
          class="styles-row"
          :style="{ '--i': index }"
        >
          <i :style="{ background: swatch.hex }" />
          {{ t(`about.portrait.swatches.${swatch.id}`) }}
          <small>{{ swatch.hex }}</small>
        </span>
      </span>

      <span class="cursor">
        <svg
          viewBox="0 0 16 16"
          width="18"
          height="18"
        >
          <path
            d="M1.5 1.5 6.8 14.5l1.9-5.8 5.8-1.9z"
            fill="var(--color-signal)"
            stroke="#fff"
            stroke-width="1.3"
            stroke-linejoin="round"
          />
        </svg>
        <b>{{ t('about.portrait.cursor') }}</b>
      </span>
    </div>

    <span
      class="cuts"
      aria-hidden="true"
    ><i
      v-for="cut in 5"
      :key="cut"
      :style="{ '--k': cut }"
    /></span>
    <ul
      class="layers"
      aria-hidden="true"
    >
      <li
        v-for="(layer, index) in layers"
        :key="layer"
        :style="{ '--i': index }"
      >
        {{ layer }}
      </li>
    </ul>

    <div
      class="picture-box is-motion"
      aria-hidden="true"
    >
      <svg
        class="vectors"
        viewBox="0 0 1024 1536"
      >
        <circle
          class="ring"
          cx="560"
          cy="330"
          r="200"
        />
        <path
          ref="motionPath"
          class="motion-path"
          :d="MOTION"
        />
        <circle
          v-for="ghost in ghosts"
          :key="ghost.at"
          class="ghost"
          :style="{ '--g': ghost.at }"
          :cx="ghost.x"
          :cy="ghost.y"
          r="13"
        />
        <circle
          ref="ball"
          class="ball"
          cx="90"
          cy="940"
          r="22"
        />
      </svg>
      <span class="tag-chip is-fps">60 fps</span>
    </div>

    <div
      class="timeline"
      aria-hidden="true"
    >
      <p class="tl-head">
        <span>timeline</span>
        <span><span ref="readout">0.00s</span> / 1.20s</span>
      </p>
      <div class="tl-grid">
        <span class="tl-ruler">
          <i
            v-for="tick in ['0', '.3', '.6', '.9', '1.2']"
            :key="tick"
          >{{ tick }}</i>
        </span>
        <template
          v-for="track in tracks"
          :key="track.id"
        >
          <span class="tl-name">{{ track.id }}</span>
          <span
            class="tl-lane"
            :style="{ '--from': track.from, '--to': track.to }"
          >
            <span class="tl-bar">{{ track.prop }}</span>
            <i class="tl-key is-start" />
            <i class="tl-key is-end" />
          </span>
        </template>
        <span class="tl-scrub"><i /></span>
      </div>
    </div>

    <span
      ref="caption"
      class="caption liquid-glass glass-on-light"
    >
      <span class="caption-window">
        <Transition
          :css="false"
          mode="out-in"
          @leave="captionLeave"
          @enter="captionEnter"
        >
          <span
            :key="chapter"
            class="caption-text"
          >
            <b v-if="chapter">{{ pad(chapter) }}</b>
            {{ chapter ? t(`about.principles.${chapter - 1}.tag`) : t('about.photo') }}
          </span>
        </Transition>
      </span>
    </span>
    <span class="sticker is-badge">
      <span class="ping-dot" />
      {{ t('about.badge') }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.portrait {
  --c: 0;
  --e: 0;
  --b: 0;
  --sel: 0;
  --pen: 0;
  --drop: 0;
  --styles: 0;
  --tag: 0;
  --cx: 32.5;
  --cy: 5.5;
  --p1: clamp(0, var(--c), 1);
  --p2: clamp(0, var(--c) - 1, 1);
  --p3: clamp(0, var(--c) - 2, 1);

  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: var(--radius-card);
  background: var(--color-stone);
  container-type: size;

  @include up(lg) {
    position: sticky;
    top: calc(var(--header-h) + 2rem);
    aspect-ratio: auto;
    height: calc(100dvh - var(--header-h) - 4rem);
  }
}

.layer {
  position: absolute;
  inset: 0;
}

.is-print {
  :deep(img) {
    filter: grayscale(1) contrast(1.15) brightness(1.02);
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--color-sand);
    mix-blend-mode: multiply;
  }
}

.is-sketch {
  background: #fff;
  mask: linear-gradient(#000 0 0) no-repeat 0 0 / 100% calc(clamp(0, var(--p1) / 0.45, 1) * 100%);
}

.sketch {
  position: absolute;
  inset: 0;
  mix-blend-mode: multiply;
}

.grid {
  position: absolute;
  inset: 0 6%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4%;

  i {
    background: rgb(255 79 26 / 0.06);
    box-shadow: inset 1px 0 0 rgb(255 79 26 / 0.2), inset -1px 0 0 rgb(255 79 26 / 0.2);
  }
}

.scan {
  --at: clamp(0, var(--p1) / 0.45, 1);

  position: absolute;
  inset-inline: 0;
  top: calc(var(--at) * 100%);
  height: 2px;
  margin-top: -1px;
  background: var(--color-signal);
  box-shadow: 0 0 1rem 0.1rem rgb(255 79 26 / 0.6);
  opacity: min(clamp(0, var(--at) * 30, 1), clamp(0, (1 - var(--at)) * 30, 1));
}

.picture-box {
  position: absolute;
  top: 0;
  left: 50%;
  width: max(100cqw, 66.667cqh);
  aspect-ratio: 2 / 3;
  translate: -50% 0;
  font-size: clamp(0.5rem, 1.75cqw, 0.75rem);
  pointer-events: none;

  &.is-design {
    opacity: min(clamp(0, (var(--c) - 0.25) * 6, 1), clamp(0, (1.25 - var(--c)) * 6, 1));
  }

  &.is-motion {
    opacity: clamp(0, (var(--c) - 2) * 6, 1);
  }
}

.vectors {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;

  * {
    vector-effect: non-scaling-stroke;
  }
}

.pen {
  fill: none;
  stroke: var(--color-signal);
  stroke-width: 2;
  stroke-dasharray: 1;
  stroke-dashoffset: calc(1 - var(--pen));
}

.pen-anchor {
  fill: #fff;
  stroke: var(--color-signal);
  stroke-width: 1.5;
  opacity: clamp(0, (var(--pen) * 1.04 - var(--f)) * 30, 1);
}

.pen-handle {
  opacity: clamp(0, (var(--pen) - var(--f)) * 12, 1);

  line {
    stroke: var(--color-signal);
    stroke-width: 1;
  }

  circle {
    fill: var(--color-signal);
  }
}

.select {
  position: absolute;
  left: 32.5%;
  top: 5.5%;
  width: calc(41.5% * var(--sel));
  height: calc(27% * var(--sel));
  box-shadow: inset 0 0 0 1.5px var(--color-signal);

  i {
    position: absolute;
    width: 0.75em;
    height: 0.75em;
    background: #fff;
    box-shadow: inset 0 0 0 1.5px var(--color-signal);

    &:nth-child(1) { left: -0.375em; top: -0.375em; }
    &:nth-child(2) { right: -0.375em; top: -0.375em; }
    &:nth-child(3) { left: -0.375em; bottom: -0.375em; }
    &:nth-child(4) { right: -0.375em; bottom: -0.375em; }
  }

  b {
    position: absolute;
    left: 50%;
    top: calc(100% + 0.8em);
    translate: -50% 0;
    padding: 0.2em 0.6em;
    border-radius: 0.45em;
    background: var(--color-signal);
    color: var(--color-ink);
    font-size: 0.95em;
    font-weight: 700;
    white-space: nowrap;
    opacity: clamp(0, (var(--sel) - 0.9) * 10, 1);
  }
}

.measure {
  position: absolute;
  left: 53.25%;
  top: 0;
  height: 5.5%;
  border-left: 1px solid var(--color-signal);
  opacity: clamp(0, (var(--sel) - 0.9) * 10, 1);

  b {
    position: absolute;
    left: 0.5em;
    top: 50%;
    translate: 0 -50%;
    font-size: 0.95em;
    font-weight: 700;
    color: var(--color-signal);
  }
}

.tag-chip {
  position: absolute;
  padding: 0.25em 0.6em;
  border-radius: 0.45em;
  font-size: 0.9em;
  font-weight: 700;
  white-space: nowrap;

  &.is-fps {
    left: 76%;
    top: 30%;
    background: var(--color-ink);
    color: var(--color-paper);
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    opacity: var(--tag);
    translate: 0 calc((1 - var(--tag)) * 0.8em);
  }
}

.dropper {
  position: absolute;
  display: flex;
  align-items: flex-end;
  gap: 0.4em;
  transform-origin: 0 100%;
  scale: max(var(--drop), 0);
  translate: 0 -100%;

  b {
    margin-bottom: 0.3em;
    padding: 0.2em 0.55em;
    border-radius: 0.45em;
    background: var(--color-ink);
    color: var(--color-paper);
    font: 700 0.9em/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  }
}

.dropper-loupe {
  width: 3.4em;
  height: 3.4em;
  border-radius: 50% 50% 50% 0;
  box-shadow: 0 0 0 0.2em #fff, 0 0 0 0.32em var(--color-signal), 0 0.6em 1.2em -0.4em rgb(17 17 19 / 0.45);
}

.styles {
  position: absolute;
  left: 3%;
  top: 14%;
  display: grid;
  gap: 0.45em;
  width: 13.5em;
  padding: 0.8em 0.9em 0.9em;
  border-radius: 0.9em;
  background: #fff;
  box-shadow: 0 0 0 1px rgb(17 17 19 / 0.08), 0 0.8em 1.6em -0.8em rgb(17 17 19 / 0.35);
  color: var(--color-ink);
  font-size: 0.95em;
  opacity: clamp(0, var(--styles) * 4, 1);
  translate: calc((1 - clamp(0, var(--styles) * 2, 1)) * -1.2em) 0;
}

.styles-title {
  font-size: 0.8em;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(17 17 19 / 0.5);
}

.styles-row {
  display: grid;
  grid-template-columns: 1.4em 1fr auto;
  align-items: center;
  gap: 0.55em;
  font-weight: 600;
  opacity: clamp(0, (var(--styles) - 0.15 - var(--i) * 0.18) * 6, 1);

  i {
    width: 1.4em;
    height: 1.4em;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgb(17 17 19 / 0.12);
  }

  small {
    font: 600 0.85em/1 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    color: rgb(17 17 19 / 0.55);
  }
}

.cursor {
  position: absolute;
  left: calc(var(--cx) * 1%);
  top: calc(var(--cy) * 1%);
  display: flex;
  align-items: flex-start;
  gap: 0.1rem;
  translate: -0.1rem -0.1rem;

  svg {
    flex: none;
    filter: drop-shadow(0 0.15rem 0.25rem rgb(17 17 19 / 0.3));
  }

  b {
    margin-top: 1.3em;
    padding: 0.25em 0.65em;
    border-radius: 0.25em 0.65em 0.65em;
    background: var(--color-signal);
    color: var(--color-ink);
    font-size: 0.95em;
    font-weight: 700;
    white-space: nowrap;
  }
}

.is-color {
  mask-image:
    linear-gradient(#000 0 0), linear-gradient(#000 0 0), linear-gradient(#000 0 0),
    linear-gradient(#000 0 0), linear-gradient(#000 0 0), linear-gradient(#000 0 0);
  mask-repeat: no-repeat;
  mask-size:
    calc(clamp(0, var(--p2) * 4.8 - 0.5, 1) * 100%) 17%,
    calc(clamp(0, var(--p2) * 4.8 - 1.1, 1) * 100%) 17%,
    calc(clamp(0, var(--p2) * 4.8 - 1.7, 1) * 100%) 17%,
    calc(clamp(0, var(--p2) * 4.8 - 2.3, 1) * 100%) 17%,
    calc(clamp(0, var(--p2) * 4.8 - 2.9, 1) * 100%) 17%,
    calc(clamp(0, var(--p2) * 4.8 - 3.5, 1) * 100%) 17%;
  mask-position: 0 100%, 0 80%, 0 60%, 0 40%, 0 20%, 0 0%;
}

.cuts,
.layers {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cuts i {
  position: absolute;
  inset-inline: 0;
  top: calc(var(--k) * 100% / 6);
  height: calc(0.5rem * clamp(0, var(--p2) * 4, 1) * (1 - var(--e)));
  translate: 0 -50%;
  background: var(--background);
}

.layers li {
  --in: clamp(0, var(--p2) * 4.8 - 0.5 - var(--i) * 0.6, 1);

  position: absolute;
  right: 1rem;
  top: calc((5 - var(--i)) * 100% / 6 + 100% / 12);
  padding: 0.3rem 0.6rem;
  border-radius: 99px;
  background: rgb(17 17 19 / 0.78);
  color: var(--color-paper);
  font: 600 0.6875rem/1 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  opacity: min(var(--in), clamp(0, 1 - var(--p3) * 3, 1));
  translate: calc((1 - var(--in)) * 0.5rem) -50%;
}

.ring {
  fill: none;
  stroke: var(--color-signal);
  stroke-width: 2;
  stroke-dasharray: 6 9;
  transform: scale(var(--b));
  transform-box: fill-box;
  transform-origin: center;
  opacity: clamp(0, var(--b) * 3, 1);
}

.motion-path {
  fill: none;
  stroke: #fff;
  stroke-width: 1.5;
  stroke-dasharray: 4 6;
  opacity: 0.8;
}

.ghost {
  fill: rgb(255 79 26 / 0.3);
  stroke: #fff;
  stroke-width: 1.25;
  opacity: clamp(0, (var(--e) - var(--g)) * 40 + 0.15, 1);
}

.ball {
  fill: var(--color-signal);
  stroke: #fff;
  stroke-width: 3;
}

.timeline {
  --in: clamp(0, (var(--c) - 2) * 6, 1);

  position: absolute;
  inset-inline: 1rem;
  bottom: 1rem;
  display: grid;
  gap: 0.7em;
  padding: 0.9em 1.1em 1em;
  border-radius: 1.1rem;
  background: rgb(17 17 19 / 0.78);
  backdrop-filter: blur(14px) saturate(1.4);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.12);
  color: #fff;
  font: 600 clamp(0.5625rem, 1.6cqw, 0.6875rem) / 1 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  opacity: var(--in);
  translate: 0 calc((1 - var(--in)) * 0.75rem);
}

.tl-head {
  display: flex;
  justify-content: space-between;
  color: rgb(255 255 255 / 0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;

  span span {
    color: #fff;
  }
}

.tl-grid {
  position: relative;
  display: grid;
  grid-template-columns: 3.4em 1fr;
  align-items: center;
  gap: 0.5em 0.9em;
}

.tl-ruler {
  position: relative;
  grid-column: 2;
  height: 1.1em;
  background: repeating-linear-gradient(90deg, rgb(255 255 255 / 0.3) 0 1px, transparent 1px calc(100% / 12)) 0 100% / 100% 0.35em no-repeat;

  i {
    position: absolute;
    top: 0;
    font-style: normal;
    color: rgb(255 255 255 / 0.5);

    @for $n from 1 through 5 {
      &:nth-child(#{$n}) {
        left: ($n - 1) * 25%;
        translate: (($n - 1) * -25%) 0;
      }
    }
  }
}

.tl-name {
  color: rgb(255 255 255 / 0.6);
}

.tl-lane {
  --fill: clamp(0, (var(--p3) - var(--from)) / (var(--to) - var(--from)), 1);

  position: relative;
  height: 1.7em;
}

.tl-bar {
  position: absolute;
  inset-block: 0;
  left: calc(var(--from) * 100%);
  width: calc((var(--to) - var(--from)) * 100%);
  display: flex;
  align-items: center;
  padding-inline: 0.8em;
  overflow: hidden;
  border-radius: 0.45em;
  background:
    linear-gradient(rgb(255 79 26 / 0.85), rgb(255 79 26 / 0.85)) no-repeat 0 0 / calc(var(--fill) * 100%) 100%,
    rgb(255 255 255 / 0.1);
  white-space: nowrap;
}

.tl-key {
  position: absolute;
  top: 50%;
  width: 0.6em;
  height: 0.6em;
  margin: -0.3em 0 0 -0.3em;
  rotate: 45deg;
  background: rgb(255 255 255 / 0.55);

  &.is-start {
    left: calc(var(--from) * 100%);
    background: color-mix(in srgb, #fff calc(clamp(0, (var(--p3) - var(--from)) * 60, 1) * 100%), rgb(255 255 255 / 0.4));
  }

  &.is-end {
    left: calc(var(--to) * 100%);
    background: color-mix(in srgb, var(--color-signal) calc(clamp(0, (var(--p3) - var(--to)) * 60 + 1, 1) * 100%), rgb(255 255 255 / 0.4));
  }
}

.tl-scrub {
  position: absolute;
  inset-block: -0.2em;
  left: calc(3.4em + 0.9em);
  right: 0;
  pointer-events: none;

  i {
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--p3) * 100%);
    width: 2px;
    margin-left: -1px;
    border-radius: 1px;
    background: #fff;
    box-shadow: 0 0 0.6em rgb(255 255 255 / 0.6);
  }
}

.caption {
  position: absolute !important;
  top: 1.25rem;
  left: 1.25rem;
  display: inline-flex;
  padding: 0.55rem 1rem;
  border-radius: 99px;
  color: var(--color-ink);
  font-size: 0.875rem;
  font-weight: 600;
}

.caption-window {
  display: block;
  overflow: hidden;
}

.caption-text {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  white-space: nowrap;

  b {
    font-family: var(--font-display);
    color: var(--color-signal);
  }
}

.sticker {
  position: absolute;
  opacity: clamp(0, 1 - var(--c) * 5, 1);
  pointer-events: none;

  &.is-badge {
    left: 1.25rem;
    bottom: 1.25rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 99px;
    background: var(--color-ink);
    color: #fff;
    font-size: 0.8125rem;
    font-weight: 600;
  }
}
</style>
