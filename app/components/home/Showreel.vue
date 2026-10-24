<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '~/data/site'

const { t } = useI18n()
const tList = useTList()
const ui = useUiStore()

const root = useTemplateRef<HTMLElement>('root')
const track = useTemplateRef<HTMLElement>('track')
const counter = useTemplateRef<HTMLElement>('counter')
const timecode = useTemplateRef<HTMLElement>('timecode')
const bar = useTemplateRef<HTMLElement>('bar')
const hint = useTemplateRef<HTMLElement>('hint')

/*
 * The showreel is a strip of film running through the screen with the scroll: a countdown leader,
 * one frame per word of the reel — each with its own little scene — and an end card. The frame in
 * the middle is in focus and plays; its neighbours are dimmed. Everything is scrubbed: the scroll
 * is the projector.
 */
type Scene = 'leader' | 'code' | 'motion' | 'cube' | 'fps' | 'again' | 'end'
interface Frame { scene: Scene, word?: string }

const SCENES: Scene[] = ['code', 'motion', 'cube', 'fps', 'again']
const frames = computed<Frame[]>(() => [
  { scene: 'leader' },
  ...tList('showreel.words').map((word, index) => ({ scene: SCENES[index % SCENES.length]!, word })),
  { scene: 'end' },
])

// a space in a word ("60 fps") would collapse inside its own inline-block letter box
const NBSP = ' '

/** The reel's running time, spread over the whole strip. */
const LENGTH = 35
const pad = (value: number) => String(value).padStart(2, '0')
const format = (seconds: number) => `${pad(Math.floor(seconds / 60))}:${pad(Math.floor(seconds % 60))}`

// fixed, so SSR and the client agree: widths of the code lines, heights of the frame-time bars
const codeLines = [62, 38, 74, 50, 28, 66, 44]
const fpsBars = [42, 48, 40, 52, 46, 44, 92, 46, 50, 42, 48, 45, 47, 41, 50, 44, 43, 49, 46, 42]

/** The player row: frame counter, timecode, progress bar. `progress` is 0–1 through the strip. */
function showPlayer(progress: number, count: number) {
  const active = Math.round(progress * (count - 1))
  if (counter.value) counter.value.textContent = `${pad(active + 1)} / ${pad(count)}`
  if (timecode.value) timecode.value.textContent = format(progress * LENGTH)
  if (bar.value) bar.value.style.scale = `${progress} 1`
}

useGsap(({ isDesktop, reduceMotion }) => {
  const el = root.value
  const row = track.value
  const gate = row?.parentElement
  if (!el || !row || !gate) return
  const items = gsap.utils.toArray<HTMLElement>('.reel-frame', row)

  // phones and reduced motion: a plain strip you swipe through, every frame fully shown; the player
  // row follows the swipe
  if (!isDesktop || reduceMotion) {
    const onSwipe = () => {
      const room = gate.scrollWidth - gate.clientWidth
      showPlayer(room > 0 ? gate.scrollLeft / room : 0, items.length)
    }
    gate.addEventListener('scroll', onSwipe, { passive: true })
    return () => gate.removeEventListener('scroll', onSwipe)
  }

  let distance = 0
  let centers: number[] = []
  let step = 1

  // the section is exactly as tall as the strip is long, so one screen of scroll moves one screen of film
  const fit = () => {
    distance = Math.max(0, row.scrollWidth - innerWidth)
    centers = items.map(item => item.offsetLeft + item.offsetWidth / 2)
    step = Math.max(1, (centers[1] ?? 1) - (centers[0] ?? 0))
    el.style.height = `${distance + innerHeight}px`
  }
  fit()
  ScrollTrigger.addEventListener('refreshInit', fit)

  let last = -1
  const render = (progress: number) => {
    if (progress === last) return
    last = progress
    const x = -progress * distance
    row.style.transform = `translate3d(${x}px, 0, 0)`

    // each frame's place relative to the gate: -1 one frame to the left, 0 centred, 1 one to the right
    const middle = innerWidth / 2
    items.forEach((item, index) => {
      const p = gsap.utils.clamp(-1.5, 1.5, ((centers[index] ?? 0) + x - middle) / step)
      item.style.setProperty('--p', p.toFixed(3))
      item.style.setProperty('--focus', Math.max(0, 1 - Math.abs(p)).toFixed(3))
      // letters come up from below as a frame arrives and leave upwards as it goes
      item.style.setProperty('--dir', p >= 0 ? '1' : '-1')
    })

    showPlayer(progress, items.length)
    if (hint.value) hint.value.style.opacity = String(gsap.utils.clamp(0, 1, 1 - progress * 30))
  }

  ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: 'bottom bottom',
    onRefresh: (self) => {
      last = -1
      render(self.progress)
    },
    onUpdate: self => render(self.progress),
  })

  // while the film fills the screen (a little before it pins and after it lets go too), the floating
  // to-top button steps aside: its corner is where the timecode sits
  ScrollTrigger.create({
    trigger: el,
    start: 'top 25%',
    end: 'bottom 75%',
    onToggle: (self) => {
      ui.immersive = self.isActive
    },
  })

  return () => {
    ScrollTrigger.removeEventListener('refreshInit', fit)
    el.style.height = ''
    row.style.transform = ''
    items.forEach(item => ['--p', '--focus', '--dir'].forEach(name => item.style.removeProperty(name)))
    ui.immersive = false
  }
}, root, { deps: () => frames.value.length })
</script>

<template>
  <section
    ref="root"
    v-pause-offscreen
    class="showreel relative"
  >
    <div class="reel-sticky">
      <div class="container-site flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p class="type-overline text-signal">
            {{ t('showreel.label') }}
          </p>
          <h2 class="mt-3 font-display text-[clamp(1.75rem,3.2vw,3.25rem)] leading-none font-semibold tracking-[-0.04em]">
            {{ t('showreel.title') }}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="liquid-glass glass-on-light inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[0.75rem] font-semibold"
            :title="t('showreel.fps')"
          >
            <span class="rec-dot" />
            <FxFpsMeter /> fps
          </span>
          <span class="liquid-glass glass-on-light hidden rounded-full px-3 py-1.5 text-[0.8125rem] whitespace-nowrap sm:inline-block">{{ t('showreel.tag') }}</span>
        </div>
      </div>

      <!-- the film: one wide black strip; the sprocket holes and the frames all move with it -->
      <div class="reel-gate">
        <div
          ref="track"
          class="reel-track"
        >
          <article
            v-for="(frame, index) in frames"
            :key="`${frame.scene}-${index}`"
            class="reel-frame"
            :class="`is-${frame.scene}`"
            :aria-label="frame.word"
            :aria-hidden="frame.word ? undefined : 'true'"
          >
            <span
              class="reel-edge"
              aria-hidden="true"
            >{{ site.brand.toUpperCase() }} ▸ 2026<b>{{ pad(index) }}</b></span>

            <div
              class="reel-picture"
              aria-hidden="true"
            >
              <!-- leader: the countdown before the reel -->
              <template v-if="frame.scene === 'leader'">
                <span class="leader-cross" />
                <span class="leader-ring" />
                <span class="leader-sweep" />
                <span class="leader-count" />
              </template>

              <!-- Code: lines of a file typing themselves in -->
              <span
                v-else-if="frame.scene === 'code'"
                class="code-lines"
              >
                <i
                  v-for="(width, line) in codeLines"
                  :key="line"
                  :style="{ '--w': `${width}%`, '--l': line }"
                />
              </span>

              <!-- Motion: an easing curve drawing itself, with the dot that rides it -->
              <svg
                v-else-if="frame.scene === 'motion'"
                class="motion-curve"
                viewBox="0 0 400 225"
                preserveAspectRatio="none"
              >
                <path
                  d="M20 190 C150 190 160 40 210 40 S300 40 380 40"
                  pathLength="1"
                />
              </svg>

              <!-- 3D: a wireframe cube the scroll turns -->
              <span
                v-else-if="frame.scene === 'cube'"
                class="cube-stage"
              >
                <span class="cube">
                  <i
                    v-for="face in 6"
                    :key="face"
                  />
                </span>
              </span>

              <!-- 60 fps: a frame-time graph with one long frame -->
              <span
                v-else-if="frame.scene === 'fps'"
                class="fps-bars"
              >
                <i
                  v-for="(height, b) in fpsBars"
                  :key="b"
                  :style="{ '--h': `${height}%`, '--b': b }"
                />
              </span>

              <!-- Again: the sun comes up behind the word -->
              <span
                v-else-if="frame.scene === 'again'"
                class="again-sun"
              />

              <!-- end card -->
              <span
                v-if="frame.scene === 'end'"
                class="end-card"
              >
                <span class="end-mark">{{ site.brand }}</span>
                <span class="end-note">{{ t('showreel.end') }}</span>
              </span>

              <span
                v-if="frame.word"
                class="reel-word"
                :style="{ '--len': frame.word.length }"
              >
                <span
                  v-for="(char, i) in frame.word"
                  :key="i"
                  class="reel-char"
                  :style="{ '--i': i }"
                >{{ char === ' ' ? NBSP : char }}</span>
              </span>

              <span class="reel-veil" />
            </div>
          </article>
        </div>

        <!-- over the frame in the gate until the film starts moving -->
        <span
          ref="hint"
          class="reel-hint"
        >
          <span
            class="reel-wheel"
            aria-hidden="true"
          />
          {{ t('showreel.hint') }}
        </span>
      </div>

      <div class="container-site reel-foot">
        <span class="font-display text-[0.8125rem] font-semibold tracking-wide whitespace-nowrap">
          <span class="text-muted-foreground">{{ t('showreel.frame') }}</span>
          <span
            ref="counter"
            class="ml-2 tabular-nums"
          >01 / {{ pad(frames.length) }}</span>
        </span>
        <span
          class="reel-bar"
          aria-hidden="true"
        ><span ref="bar" /></span>
        <span
          ref="timecode"
          class="font-display text-[clamp(1.25rem,1.8vw,1.75rem)] font-semibold tabular-nums"
        >00:00</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
// the gate and the strip: a frame is 16:9 and the strip is the frame plus room for holes and edge print
.showreel {
  --rail: 3rem;
  --frame-w: 84vw;
  --frame-h: calc(var(--frame-w) * 9 / 16);
  --film: var(--color-ink);

  padding-block: clamp(4rem, 8vw, 7rem);

  @include dark {
    --film: #1b1b1e;
  }
}

.reel-sticky {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 3vh, 2.25rem);
}

.reel-gate {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.reel-track {
  position: relative;
  display: flex;
  gap: 1.5rem;
  width: max-content;
  padding: var(--rail) calc((100vw - var(--frame-w)) / 2);
  background: var(--film);

  // sprocket holes, top and bottom: the page showing through rounded cut-outs, masked from one tile
  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 1.25rem;
    background: var(--background);
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='20'%3E%3Crect x='9' y='5' width='14' height='10' rx='3'/%3E%3C/svg%3E") repeat-x 0 0 / 2rem 1.25rem;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='20'%3E%3Crect x='9' y='5' width='14' height='10' rx='3'/%3E%3C/svg%3E") repeat-x 0 0 / 2rem 1.25rem;
  }

  &::before {
    top: 0.45rem;
  }

  &::after {
    bottom: 0.45rem;
  }
}

.reel-frame {
  // at rest (phones, reduced motion) every frame is fully shown; the script drives these on desktop
  --p: 0;
  --focus: 1;
  --dir: 1;

  position: relative;
  flex: none;
  width: var(--frame-w);
  scroll-snap-align: center;
}

// the edge print between the holes and the picture, like the numbers on real stock
.reel-edge {
  position: absolute;
  left: 0.25rem;
  bottom: calc(100% + 0.35rem);
  display: flex;
  gap: 1.25rem;
  font-family: var(--font-display);
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: rgb(255 79 26 / 0.75);
  white-space: nowrap;

  b {
    font-weight: 700;
  }
}

.reel-picture {
  position: relative;
  height: var(--frame-h);
  overflow: hidden;
  border-radius: 0.75rem;
  background: radial-gradient(circle at 50% 42%, #26262b, #121214 72%);
  color: var(--color-paper);
  container-type: size;
  isolation: isolate;
}

// the neighbours of the frame in the gate sit in the dark
.reel-veil {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: #0a0a0b;
  opacity: calc((1 - var(--focus)) * 0.72);
  pointer-events: none;
}

// ——— the word ———

.reel-word {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  // long words get smaller: about 118 container widths shared between the letters, capped by the height
  font-size: min(calc(118cqw / (var(--len) + 1)), 34cqh);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.045em;
  white-space: nowrap;
}

// each letter rides in on its own, a little after the one before it (a mask clips the travel)
.reel-char {
  display: inline-block;
  padding-block: 0.12em;
  clip-path: inset(0 -0.1em);
  translate: 0 calc(var(--dir) * clamp(0, (1 - var(--focus)) * 2.4 - var(--i) * 0.14, 1) * 115%);

}

// ——— scenes ———

// leader: crosshair, ring, a sweep going round and the count 3, 2, 1
@property --sweep {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.leader-cross {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgb(255 255 255 / 0.14), rgb(255 255 255 / 0.14)) center / 100% 1px no-repeat,
    linear-gradient(rgb(255 255 255 / 0.14), rgb(255 255 255 / 0.14)) center / 1px 100% no-repeat;
}

.leader-ring,
.leader-sweep {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 62cqh;
  aspect-ratio: 1;
  translate: -50% -50%;
  border-radius: 50%;
}

.leader-ring {
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.3), 0 0 0 1.4cqh rgb(255 255 255 / 0.05);
}

.leader-sweep {
  background: conic-gradient(rgb(255 79 26 / 0.45) var(--sweep), transparent var(--sweep));
  animation: sweep 1s linear infinite;
}

.leader-count::after {
  content: "3";
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-size: 40cqh;
  font-weight: 600;
  line-height: 1;
  animation: count 3s steps(1) infinite;
}

@keyframes sweep {
  to {
    --sweep: 360deg;
  }
}

@keyframes count {
  0% {
    content: "3";
  }

  33.33% {
    content: "2";
  }

  66.66% {
    content: "1";
  }
}

// code: the lines of a file, typed in top to bottom as the frame arrives
.code-lines {
  position: absolute;
  left: 7%;
  top: 14%;
  bottom: 14%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 40%;

  i {
    display: block;
    width: var(--w);
    height: 0.6cqh;
    min-height: 3px;
    border-radius: 99px;
    background: rgb(255 255 255 / 0.12);
    transform-origin: left;
    scale: clamp(0, var(--focus) * 2 - var(--l) * 0.12, 1) 1;

    &:nth-child(3) {
      background: rgb(255 79 26 / 0.6);
    }
  }
}

// motion: the curve draws itself as the frame comes into the gate
.motion-curve {
  position: absolute;
  inset: 8% 6%;
  width: 88%;
  height: 84%;
  overflow: visible;

  path {
    fill: none;
    stroke: var(--color-signal);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: calc(1 - var(--focus));
    vector-effect: non-scaling-stroke;
  }
}

// 3d: the scroll turns the cube as the frame goes past
.cube-stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  perspective: 120cqh;
}

.cube {
  --s: 46cqh;

  position: relative;
  width: var(--s);
  height: var(--s);
  transform-style: preserve-3d;
  transform: rotateX(calc(-22deg + var(--p) * -70deg)) rotateY(calc(34deg + var(--p) * 120deg));

  i {
    position: absolute;
    inset: 0;
    border: 1px solid rgb(255 255 255 / 0.28);
    border-radius: 0.6cqh;
    background: rgb(255 255 255 / 0.02);

    &:nth-child(1) { transform: translateZ(calc(var(--s) / 2)); border-color: rgb(255 79 26 / 0.7); }
    &:nth-child(2) { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); }
    &:nth-child(3) { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); }
    &:nth-child(4) { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); }
    &:nth-child(5) { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); }
    &:nth-child(6) { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); }
  }
}

// fps: frame times as bars, one long frame in signal; they rise in left to right
.fps-bars {
  position: absolute;
  left: 6%;
  right: 6%;
  bottom: 10%;
  height: 28%;
  display: flex;
  align-items: flex-end;
  gap: 0.8%;

  i {
    flex: 1;
    height: var(--h);
    border-radius: 0.4cqh 0.4cqh 0 0;
    background: rgb(255 255 255 / 0.16);
    transform-origin: bottom;
    scale: 1 clamp(0, var(--focus) * 2.2 - var(--b) * 0.05, 1);

    &:nth-child(7) {
      background: var(--color-signal);
    }
  }
}

// again: the sun rises behind the word as the frame arrives
.again-sun {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 70cqh;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, #ff7a4d, var(--color-signal) 60%);
  translate: -50% calc(-30% + (1 - var(--focus)) * 70%);
  opacity: 0.9;
}

// end card
.end-card {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 4cqh;
  text-align: center;
  opacity: var(--focus);
}

.end-mark {
  font-family: var(--font-display);
  font-size: 24cqh;
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.04em;
}

.end-note {
  font-size: max(0.8125rem, 3.4cqh);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(242 241 237 / 0.6);
}

// ——— the player row under the film ———

.reel-foot {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.reel-bar {
  position: relative;
  flex: 1;
  height: 0.25rem;
  overflow: hidden;
  border-radius: 99px;
  background: var(--border);

  span {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--color-signal);
    transform-origin: left;
    scale: 0 1;
  }
}

.reel-hint {
  display: none;
}

.rec-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: var(--color-signal);
  animation: rec 1.2s steps(1) infinite;
}

@keyframes rec {
  50% {
    opacity: 0.2;
  }
}

/* ——— desktop: the section pins and the scroll runs the film through the gate ——— */

@media (width >= 64rem) and (prefers-reduced-motion: no-preference) {
  .showreel {
    // replaced by the exact length once the script measures the strip
    height: 600vh;
    padding-block: 0;
    // the frame fills what the screen has left after the header, the title row and the player row
    --frame-w: min(calc((min(60dvh, 42rem) - 2 * var(--rail)) * 16 / 9), 70vw);
  }

  .reel-sticky {
    position: sticky;
    top: 0;
    justify-content: center;
    height: 100dvh;
    padding-top: var(--header-h);
  }

  .reel-gate {
    position: relative;
    overflow: hidden;
    scroll-snap-type: none;
  }

  .reel-track {
    will-change: transform;
  }

  .reel-hint {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 1rem 0.6rem 0.75rem;
    border-radius: 99px;
    background: rgb(17 17 19 / 0.55);
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.18);
    color: var(--color-paper);
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
    // under the countdown, not over it
    translate: -50% calc(var(--frame-h) * 0.5 - 100% - 1.25rem);
    pointer-events: none;
  }
}

// a mouse with its wheel rolling down
.reel-wheel {
  position: relative;
  width: 0.85rem;
  height: 1.25rem;
  border-radius: 99px;
  box-shadow: inset 0 0 0 1.5px currentColor;

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 0.25rem;
    width: 0.2rem;
    height: 0.3rem;
    margin-left: -0.1rem;
    border-radius: 99px;
    background: var(--color-signal);
    animation: wheel 1.6s var(--ease-in-out-quart) infinite;
  }
}

@keyframes wheel {
  60%,
  100% {
    translate: 0 0.45rem;
    opacity: 0;
  }
}

@include reduced-motion {
  .leader-sweep,
  .leader-count::after,
  .rec-dot,
  .reel-wheel::after {
    animation: none;
  }
}
</style>
