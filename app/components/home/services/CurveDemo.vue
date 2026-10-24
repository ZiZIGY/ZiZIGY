<script setup lang="ts">
import { gsap } from 'gsap'

/*
 * An easing editor: drag the two handles and the ball below rides the curve you drew (a faint ghost
 * keeps linear time for comparison). The presets glide the handles to a few curves used on this site.
 */
const { t } = useI18n()

// the plot in the 120×100 viewBox: x 10…110 is time, y 90…10 is progress 0…1
const X0 = 10
const W = 100
const Y0 = 90
const H = 80
const sx = (x: number) => X0 + x * W
const sy = (y: number) => Y0 - y * H

const handles = reactive({ x1: 0.65, y1: 0, x2: 0.35, y2: 1 })
const presets = [
  { name: 'in-out', x1: 0.65, y1: 0, x2: 0.35, y2: 1 },
  { name: 'back', x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 },
  { name: 'expo', x1: 0.16, y1: 1, x2: 0.3, y2: 1 },
] as const

const round = (value: number) => Math.round(value * 100) / 100
const curve = computed(() => `M ${sx(0)} ${sy(0)} C ${sx(handles.x1)} ${sy(handles.y1)}, ${sx(handles.x2)} ${sy(handles.y2)}, ${sx(1)} ${sy(1)}`)
const css = computed(() => `cubic-bezier(${round(handles.x1)}, ${round(handles.y1)}, ${round(handles.x2)}, ${round(handles.y2)})`)
const active = computed(() => presets.find(p => Object.keys(handles).every(k => round(handles[k as keyof typeof handles]) === p[k as keyof typeof handles]))?.name)

const svg = useTemplateRef<SVGSVGElement>('svg')
let dragging: 1 | 2 | null = null

function grab(which: 1 | 2, event: PointerEvent) {
  dragging = which
  ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
  gsap.killTweensOf(handles)
}

function drag(event: PointerEvent) {
  if (!dragging || !svg.value) return
  const rect = svg.value.getBoundingClientRect()
  const vx = ((event.clientX - rect.left) / rect.width) * 120
  const vy = ((event.clientY - rect.top) / rect.height) * 100
  // time can't run backwards (x stays in 0…1); progress may overshoot a little either way
  const x = gsap.utils.clamp(0, 1, (vx - X0) / W)
  const y = gsap.utils.clamp(-0.5, 1.5, (Y0 - vy) / H)
  if (dragging === 1) Object.assign(handles, { x1: x, y1: y })
  else Object.assign(handles, { x2: x, y2: y })
}

function drop() {
  dragging = null
}

function choose(preset: (typeof presets)[number]) {
  gsap.to(handles, { x1: preset.x1, y1: preset.y1, x2: preset.x2, y2: preset.y2, duration: 0.6, ease: 'power3.inOut', overwrite: true })
}
</script>

<template>
  <div class="curve-demo">
    <svg
      ref="svg"
      class="curve-plot"
      viewBox="0 0 120 100"
      @pointermove="drag"
      @pointerup="drop"
      @pointercancel="drop"
    >
      <rect
        class="plot-box"
        :x="X0"
        :y="Y0 - H"
        :width="W"
        :height="H"
        rx="3"
      />
      <line
        class="plot-linear"
        :x1="sx(0)"
        :y1="sy(0)"
        :x2="sx(1)"
        :y2="sy(1)"
      />
      <line
        class="plot-arm"
        :x1="sx(0)"
        :y1="sy(0)"
        :x2="sx(handles.x1)"
        :y2="sy(handles.y1)"
      />
      <line
        class="plot-arm"
        :x1="sx(1)"
        :y1="sy(1)"
        :x2="sx(handles.x2)"
        :y2="sy(handles.y2)"
      />
      <path
        class="plot-curve"
        :d="curve"
      />
      <circle
        class="plot-end"
        :cx="sx(0)"
        :cy="sy(0)"
        r="1.8"
      />
      <circle
        class="plot-end"
        :cx="sx(1)"
        :cy="sy(1)"
        r="1.8"
      />
      <g
        v-for="which in ([1, 2] as const)"
        :key="which"
        class="plot-handle"
        data-cursor="drag"
        @pointerdown="grab(which, $event)"
      >
        <circle
          class="handle-hit"
          :cx="sx(which === 1 ? handles.x1 : handles.x2)"
          :cy="sy(which === 1 ? handles.y1 : handles.y2)"
          r="9"
        />
        <circle
          class="handle-dot"
          :cx="sx(which === 1 ? handles.x1 : handles.x2)"
          :cy="sy(which === 1 ? handles.y1 : handles.y2)"
          r="3.4"
        />
      </g>
    </svg>

    <!-- the result: the ball rides the curve, its ghost keeps linear time -->
    <div
      class="curve-track"
      :style="{ '--ease': css }"
      aria-hidden="true"
    >
      <span class="track-ball is-ghost" />
      <span class="track-ball" />
    </div>

    <div class="curve-foot">
      <code class="curve-code">{{ css }}</code>
      <span class="flex gap-1">
        <button
          v-for="preset in presets"
          :key="preset.name"
          type="button"
          class="curve-preset"
          :class="{ 'is-active': active === preset.name }"
          @click="choose(preset)"
        >{{ preset.name }}</button>
      </span>
    </div>
    <p class="curve-hint">
      {{ t('services.demo.curve') }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.curve-demo {
  display: grid;
  gap: 0.9rem;
}

.curve-plot {
  width: 100%;
  aspect-ratio: 120 / 100;
  max-height: 15rem;
  overflow: visible;
  touch-action: none;
}

.plot-box {
  fill: color-mix(in srgb, var(--foreground) 3%, transparent);
  stroke: var(--border);
  stroke-width: 0.5;
}

.plot-linear {
  stroke: var(--border);
  stroke-width: 0.6;
  stroke-dasharray: 2 2;
}

.plot-arm {
  stroke: color-mix(in srgb, var(--foreground) 35%, transparent);
  stroke-width: 0.6;
}

.plot-curve {
  fill: none;
  stroke: var(--color-signal);
  stroke-width: 2;
  stroke-linecap: round;
}

.plot-end {
  fill: var(--foreground);
}

.plot-handle {
  cursor: grab;
}

.handle-hit {
  fill: transparent;
}

.handle-dot {
  fill: var(--card);
  stroke: var(--color-signal);
  stroke-width: 1.4;
  transition: r 0.3s var(--ease-out-expo);
}

.plot-handle:hover .handle-dot {
  r: 4.4;
}

// a size container, so the ball can travel by translate (compositor only) instead of by left
.curve-track {
  position: relative;
  height: 2rem;
  border-radius: 99px;
  background: color-mix(in srgb, var(--foreground) 5%, transparent);
  container-type: inline-size;
}

.track-ball {
  position: absolute;
  left: 0.25rem;
  top: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--color-signal);
  animation: ride 1.8s var(--ease) infinite alternate;

  &.is-ghost {
    background: color-mix(in srgb, var(--foreground) 14%, transparent);
    animation-timing-function: linear;
  }
}

@keyframes ride {
  to {
    translate: calc(100cqw - 2rem) 0;
  }
}

.curve-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.curve-code {
  font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  color: var(--muted-foreground);
}

.curve-preset {
  min-height: 2.25rem;
  padding: 0.3rem 0.8rem;
  border-radius: 99px;
  box-shadow: inset 0 0 0 1px var(--border);
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 0.3s, color 0.3s;

  &.is-active {
    background: var(--foreground);
    color: var(--background);
    box-shadow: none;
  }
}

.curve-hint {
  font-size: 0.8125rem;
  color: var(--muted-foreground);
}

@include reduced-motion {
  .track-ball {
    animation: none;
  }
}
</style>
