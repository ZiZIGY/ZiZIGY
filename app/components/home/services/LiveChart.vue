<script setup lang="ts">
/*
 * A live feed: a new reading arrives every so often and the line shifts left to make room, like a
 * WebSocket dashboard would. Readings only come in while the chart is on screen.
 */
const { t, locale } = useI18n()

const COUNT = 28
// a fixed start, so the server and the client render the same line
const values = ref<number[]>(Array.from({ length: COUNT }, (_, i) => 48 + Math.sin(i * 0.7) * 9 + Math.cos(i * 1.9) * 4))

const points = computed(() => values.value
  .map((value, i) => `${((i / (COUNT - 1)) * 100).toFixed(2)},${(100 - value).toFixed(2)}`)
  .join(' '))
const area = computed(() => `0,100 ${points.value} 100,100`)
const last = computed(() => values.value.at(-1) ?? 0)
const reading = computed(() => new Intl.NumberFormat(locale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(last.value))

const root = useTemplateRef<HTMLElement>('root')
const visible = useElementVisibility(root)
const reducedMotion = usePreferredReducedMotion()

// a gentle random walk that keeps to the middle of the chart
const { pause, resume } = useIntervalFn(() => {
  const previous = last.value
  const next = Math.min(82, Math.max(18, previous + (Math.random() - 0.5) * 14 + (50 - previous) * 0.08))
  values.value = [...values.value.slice(1), next]
}, 900, { immediate: false })

watchEffect(() => {
  if (visible.value && reducedMotion.value !== 'reduce') resume()
  else pause()
})
</script>

<template>
  <div
    ref="root"
    class="live-chart"
  >
    <div class="flex items-center justify-between gap-3">
      <span class="inline-flex items-center gap-2 text-[0.75rem] font-semibold tracking-[0.12em] uppercase">
        <span class="ping-dot" />
        {{ t('services.demo.live') }}
      </span>
      <span class="font-display text-[1.25rem] font-semibold tabular-nums">{{ reading }}</span>
    </div>
    <svg
      class="chart"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon
        class="chart-area"
        :points="area"
      />
      <polyline
        class="chart-line"
        :points="points"
      />
    </svg>
  </div>
</template>

<style scoped>
.live-chart {
  display: grid;
  gap: 0.75rem;
}

.chart {
  width: 100%;
  height: 5.5rem;
  overflow: visible;
}

.chart-area {
  fill: rgb(255 79 26 / 0.12);
}

.chart-line {
  fill: none;
  stroke: var(--color-signal);
  stroke-width: 2;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
</style>
