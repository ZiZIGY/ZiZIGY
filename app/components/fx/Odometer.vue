<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = withDefaults(defineProps<{
  value: number
  /** Thousands separators of the current locale. */
  group?: boolean
  /** Spin up from zeros the first time it scrolls into view. */
  rollIn?: boolean
  /** Seconds to wait before the roll-in, so a row of figures can land one after another. */
  delay?: number
}>(), { group: true, rollIn: true, delay: 0 })

const { locale } = useI18n()
const reducedMotion = usePreferredReducedMotion()

// Each digit is a column holding two runs of 0–9; at rest it shows the second run, so a roll-in turns
// once through to its digit and a change of value rolls straight to the new one.
const CELLS = 20
const REST = 10

const text = computed(() => (props.group ? new Intl.NumberFormat(locale.value).format(props.value) : String(props.value)))
const chars = computed(() => [...text.value].map(char => ({ char, digit: /\d/.test(char) ? Number(char) : null })))
const offset = (cell: number) => (-cell / CELLS) * 100

const root = useTemplateRef<HTMLElement>('root')
const strips = () => gsap.utils.toArray<HTMLElement>('.odo-strip', root.value)
const digits = () => chars.value.filter(item => item.digit !== null).map(item => item.digit!)

// the strips start where CSS put them (the --cell variable, right for SSR and reduced motion); from here
// on GSAP owns their transform, so the px offset parsed from that CSS is reset to a plain yPercent
useGsap(({ reduceMotion }) => {
  const el = root.value
  if (!el || reduceMotion) return
  const columns = strips()
  gsap.set(columns, { y: 0, yPercent: index => offset(REST + digits()[index]!) })
  if (!props.rollIn) return

  gsap.set(columns, { yPercent: 0 })
  ScrollTrigger.create({
    trigger: el,
    start: 'top 92%',
    once: true,
    // the digits land left to right, so the figure reads in order as it settles
    onEnter: () => {
      gsap.to(columns, {
        yPercent: index => offset(REST + digits()[index]!),
        duration: 1.3,
        ease: 'power4.out',
        delay: props.delay,
        stagger: 0.12,
      })
    },
  })
}, root)

// a new value rolls each column to its new digit. It starts moving at once and settles (expo.out):
// an in-out ease sat still for the first third, then rushed, which read as lag
watch(() => props.value, () => {
  if (reducedMotion.value === 'reduce') return
  nextTick(() => {
    // only the columns that change take turns (left to right), so 2019 → 2022 starts at once
    const columns = strips()
    const targets = digits().map(digit => offset(REST + digit))
    let turn = 0
    const delays = columns.map((column, index) => (Math.abs(Number(gsap.getProperty(column, 'yPercent')) - targets[index]!) > 0.01 ? turn++ * 0.05 : 0))
    gsap.to(columns, {
      yPercent: index => targets[index]!,
      duration: 0.8,
      ease: 'expo.out',
      delay: index => delays[index]!,
      overwrite: true,
    })
  })
})
</script>

<template>
  <span
    ref="root"
    class="odo"
  >
    <span class="sr-only">{{ text }}</span>
    <span
      class="odo-row"
      aria-hidden="true"
    >
      <template
        v-for="(item, index) in chars"
        :key="index"
      >
        <span
          v-if="item.digit !== null"
          class="odo-column"
        >
          <span
            class="odo-strip"
            :style="{ '--cell': REST + item.digit }"
          >
            <span
              v-for="cell in CELLS"
              :key="cell"
              class="odo-cell"
            >{{ (cell - 1) % 10 }}</span>
          </span>
        </span>
        <span
          v-else
          class="odo-sep"
        >{{ item.char }}</span>
      </template>
    </span>
  </span>
</template>

<style scoped>
.odo,
.odo-row {
  display: inline-flex;
}

.odo-column {
  display: inline-block;
  /* the window is one digit tall plus a little room on every side, so glyphs that overshoot the em
     box, or the advance that negative letter-spacing shrinks, aren't shaved. content-box: with the
     global border-box the padding ate into the 1em and the window sat 0.08em too high */
  box-sizing: content-box;
  height: 1em;
  padding: 0.08em 0.06em;
  margin: -0.08em -0.06em;
  overflow: hidden;
  font-variant-numeric: tabular-nums;
}

.odo-strip {
  display: block;
  /* --cell / CELLS of the strip's height (keep the divisor in step with CELLS) */
  transform: translateY(calc(var(--cell) * -100% / 20));
  /* its own layer for good: a strip is twenty glyphs tall, and re-rasterising it whenever a roll starts
     (GSAP promotes only for the tween) cost a hitch right at the start */
  will-change: transform;
}

.odo-cell {
  display: block;
  height: 1em;
  line-height: 1em;
  text-align: center;
}

.odo-sep {
  display: inline-block;
  line-height: 1em;
  white-space: pre;
}
</style>
