<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { library, libraryStats as stats } from '~/data/library'

/*
 * vue-dnd-kit in numbers, on its case page, from figures taken by hand off GitHub and npm
 * (data/library.ts). The big ones are shown rounded down ("350 000+"); the chart is the downloads by
 * month since the first release, with a marker where each major version shipped. Its columns grow from
 * the baseline with the scroll; every value is also in the hidden table, the tooltip only adds to it.
 */
const { t, locale } = useI18n()

const months = stats.monthly
const latest = months.at(-1)!
const peak = Math.max(...months.map(month => month.downloads))
// the same month a year before, for the headline's comparison
const growth = (() => {
  const [year, month] = latest.month.split('-')
  const before = months.find(item => item.month === `${Number(year) - 1}-${month}`)
  return before ? Math.round(latest.downloads / before.downloads) : null
})()
// the plot's top sits a little above the peak, so the peak's label has room
const ceiling = peak * 1.18
const step = [1000, 2500, 5000, 10000, 25000, 50000, 100000].find(size => peak / size <= 3) ?? 250000
const gridlines = Array.from({ length: Math.floor(peak / step) }, (_, index) => (index + 1) * step)
// the majors that shipped inside the plotted months, placed at the start of their column
const markers = stats.majors
  .map(major => ({ label: `v${major.version.split('.')[0]}.0`, index: months.findIndex(month => month.month === major.month) }))
  .filter(marker => marker.index >= 0)

// two significant digits, rounded down: 352 376 → 350 000, 257 → 250 (shown with a "+")
const roughly = (value: number) => {
  if (value < 100) return value
  const unit = 10 ** (Math.floor(Math.log10(value)) - 1)
  return Math.floor(value / unit) * unit
}

const install = `pnpm add ${library.package}`
const { copy, copied } = useClipboard({ source: install, copiedDuring: 2000 })

const number = (value: number) => new Intl.NumberFormat(locale.value).format(value)
const compact = (value: number) => new Intl.NumberFormat(locale.value, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
const dateOf = (iso: string) => new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, 1)
const monthName = (iso: string, month: 'long' | 'short' | 'narrow') => new Intl.DateTimeFormat(locale.value, { month }).format(dateOf(iso))
const monthYear = (iso: string) => `${monthName(iso, 'long')} ${iso.slice(0, 4)}`

// the column under the pointer, for the tooltip
const hovered = ref<number | null>(null)
const tip = computed(() => (hovered.value === null ? null : { index: hovered.value, ...months[hovered.value]! }))

const root = useTemplateRef<HTMLElement>('root')

useGsap(({ reduceMotion }) => {
  const el = root.value
  if (!el || reduceMotion) return
  const fill = (self: ScrollTrigger) => el.style.setProperty('--fill', self.progress.toFixed(4))
  ScrollTrigger.create({ trigger: el.querySelector('.chart'), start: 'top 90%', end: 'top 35%', onUpdate: fill, onRefresh: fill })
  return undefined
}, root)
</script>

<template>
  <section
    ref="root"
    class="library container-site pb-[clamp(5rem,10vw,10rem)]"
  >
    <div class="library-panel">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <span class="library-chip">{{ t('project.library.overline') }}</span>
        <span class="flex gap-6">
          <a
            class="library-link"
            :href="`https://github.com/${library.repo}`"
            target="_blank"
            rel="noopener"
          >GitHub <FxArrow class="size-3.5" /></a>
          <a
            class="library-link"
            :href="`https://www.npmjs.com/package/${library.package}`"
            target="_blank"
            rel="noopener"
          >npm <FxArrow class="size-3.5" /></a>
        </span>
      </header>

      <h2 class="library-title">
        {{ growth
          ? t('project.library.title', { downloads: number(roughly(latest.downloads)), n: growth })
          : t('project.library.titlePlain', { downloads: number(roughly(latest.downloads)) }) }}
      </h2>

      <dl class="library-figures">
        <div>
          <dt>{{ t('project.library.total') }}</dt>
          <dd class="figure-value">
            <FxOdometer
              :value="roughly(stats.total)"
              :delay="0.15"
            /><span class="text-signal">+</span>
          </dd>
        </div>
        <div>
          <dt>{{ t('project.library.stars') }}</dt>
          <dd class="figure-value">
            <FxOdometer
              :value="roughly(stats.stars)"
              :delay="0.35"
            /><span class="text-signal">+</span>
          </dd>
        </div>
        <div>
          <dt>{{ t('project.library.releases') }}</dt>
          <dd class="figure-value">
            <FxOdometer
              :value="roughly(stats.releases)"
              :delay="0.55"
            /><span class="text-signal">+</span>
          </dd>
          <dd class="figure-note">
            {{ t('project.library.latest', { version: stats.latest.version }) }}
          </dd>
        </div>
        <div>
          <dt>{{ t('project.library.dependencies') }}</dt>
          <dd class="figure-value">
            <FxOdometer
              :value="stats.dependencies"
              :delay="0.75"
            />
          </dd>
          <dd
            v-if="!stats.dependencies"
            class="figure-note"
          >
            {{ t('project.library.dependenciesNote') }}
          </dd>
        </div>
      </dl>

      <figure class="chart">
        <figcaption class="chart-caption">
          {{ t('project.library.chart', { package: library.package }) }}
        </figcaption>
        <div
          class="chart-plot"
          :style="{ '--count': months.length }"
          aria-hidden="true"
        >
          <span
            v-for="line in gridlines"
            :key="line"
            class="chart-grid"
            :style="{ bottom: `${(line / ceiling) * 100}%` }"
          ><b>{{ compact(line) }}</b></span>
          <span
            v-for="marker in markers"
            :key="marker.label"
            class="chart-marker"
            :style="{ '--x': marker.index / months.length }"
          ><b>{{ marker.label }}</b></span>
          <span
            v-for="(month, index) in months"
            :key="month.month"
            class="chart-column"
            :class="{ 'is-latest': index === months.length - 1, 'is-hovered': index === hovered }"
            :style="{ '--h': month.downloads / ceiling, '--i': index / months.length }"
            @pointerenter="hovered = index"
            @pointerleave="hovered = null"
          >
            <i class="chart-bar" />
            <b
              v-if="month.downloads === peak && index !== hovered"
              class="chart-peak"
            >{{ compact(month.downloads) }}</b>
          </span>
          <span
            v-if="tip"
            class="chart-tip"
            :style="{ '--x': (tip.index + 0.5) / months.length, '--h': tip.downloads / ceiling }"
          >
            <b>{{ number(tip.downloads) }}</b>
            <span>{{ monthYear(tip.month) }}</span>
          </span>
        </div>
        <div
          class="chart-axis"
          :style="{ '--count': months.length }"
          aria-hidden="true"
        >
          <span
            v-for="(month, index) in months"
            :key="month.month"
          >
            <span class="max-md:hidden">{{ monthName(month.month, 'short') }}</span>
            <span class="md:hidden">{{ monthName(month.month, 'narrow') }}</span>
            <!-- the year under its first month on the plot, and under every January -->
            <b v-if="index === 0 || month.month.endsWith('-01')">{{ month.month.slice(0, 4) }}</b>
          </span>
        </div>
        <table class="sr-only">
          <thead>
            <tr>
              <th>{{ t('project.library.monthColumn') }}</th>
              <th>{{ t('project.library.downloadsColumn') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="month in months"
              :key="month.month"
            >
              <td>{{ monthYear(month.month) }}</td>
              <td>{{ number(month.downloads) }}</td>
            </tr>
          </tbody>
        </table>
      </figure>

      <footer class="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          class="install"
          data-cursor="copy"
          :aria-label="copied ? t('project.library.copied') : t('project.library.copy')"
          @click="copy()"
        >
          <code><span class="text-signal">$</span> {{ install }}</code>
          <Check
            v-if="copied"
            class="size-4 text-signal"
          />
          <Copy
            v-else
            class="size-4 opacity-60"
          />
        </button>
        <p class="text-[0.8125rem] text-paper/50">
          {{ t('project.library.note', { date: monthYear(stats.asOf) }) }}
        </p>
      </footer>
    </div>
  </section>
</template>

<style scoped lang="scss">
// --fill is how far the chart has been read in, 0…1; complete until the script says otherwise
.library {
  --fill: 1;
}

.library-panel {
  display: grid;
  gap: clamp(2rem, 4vw, 3.25rem);
  padding: clamp(1.5rem, 4vw, 3.5rem);
  border-radius: var(--radius-card);
  background: var(--color-ink);
  color: var(--color-paper);

  @include dark {
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1);
  }
}

.library-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.9rem;
  border-radius: 99px;
  background: rgb(242 241 237 / 0.08);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(242 241 237 / 0.7);
}

.library-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  font-size: 0.875rem;
  font-weight: 600;

  :deep(svg) {
    transition: translate 0.5s var(--ease-out-expo);
  }

  @include hover {
    color: var(--color-signal);

    :deep(svg) {
      translate: 0.2rem -0.2rem;
    }
  }
}

.library-title {
  max-width: 22ch;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3.6vw, 3.5rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.library-figures {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.75rem 1.5rem;

  @include up(lg) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  > div {
    display: grid;
    align-content: start;
    gap: 0.6rem;
    padding-top: 1rem;
    box-shadow: inset 0 1px 0 rgb(242 241 237 / 0.14);
    // the figures size to their cell, so the widest ("350,000+") never runs into the next
    container-type: inline-size;
  }

  dt {
    font-size: 0.8125rem;
    color: rgb(242 241 237 / 0.6);
  }
}

.figure-value {
  display: inline-flex;
  align-items: flex-start;
  font-family: var(--font-display);
  font-size: min(clamp(2rem, 4.2vw, 3.75rem), 17.5cqi);
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.05em;
}

.figure-note {
  font-size: 0.8125rem;
  color: rgb(242 241 237 / 0.6);
}

// ——— the chart: one series, the latest month in signal, the rest a quiet step of the paper ———

.chart-caption {
  margin-bottom: 1.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(242 241 237 / 0.6);
}

.chart-plot {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--count), 1fr);
  height: clamp(11rem, 22vw, 17rem);
  // room above the plot for the release labels
  margin-top: 2rem;
  // the baseline
  box-shadow: inset 0 -1px 0 rgb(242 241 237 / 0.25);
}

.chart-grid {
  position: absolute;
  inset-inline: 0;
  height: 1px;
  background: rgb(242 241 237 / 0.1);
  pointer-events: none;

  // on the left, where the bars are still low: the right end belongs to the latest months
  b {
    position: absolute;
    left: 0.4rem;
    bottom: 0.3rem;
    font-size: 0.6875rem;
    font-weight: 600;
    color: rgb(242 241 237 / 0.45);
    font-variant-numeric: tabular-nums;
  }
}

// a release: a hairline at the start of its month's column, its version just above the plot, clear of the gridline labels
.chart-marker {
  position: absolute;
  top: -1.75rem;
  bottom: 0;
  left: calc(var(--x) * 100%);
  width: 1px;
  background: rgb(242 241 237 / 0.35);
  pointer-events: none;

  b {
    position: absolute;
    top: 0;
    left: 0.4rem;
    padding: 0.15rem 0.45rem;
    border-radius: 0.4rem;
    background: rgb(242 241 237 / 0.12);
    font-size: 0.6875rem;
    font-weight: 700;
    white-space: nowrap;
  }
}

// the column is the hit target, the bar inside it the mark: at most 24px, a 4px round tip, square at the baseline
.chart-column {
  --grow: clamp(0, var(--fill) * 1.5 - var(--i) * 0.5, 1);

  position: relative;
  display: flex;
  justify-content: center;
}

.chart-bar {
  position: absolute;
  bottom: 0;
  width: min(24px, 60%);
  height: calc(var(--h) * var(--grow) * 100%);
  border-radius: 4px 4px 0 0;
  background: rgb(242 241 237 / 0.28);
  transition: background-color 0.25s;

  .is-latest & {
    background: var(--color-signal);
  }

  .is-hovered:not(.is-latest) & {
    background: rgb(242 241 237 / 0.55);
  }
}

// the one value on the plot: the extreme
.chart-peak {
  position: absolute;
  bottom: calc(var(--h) * var(--grow) * 100% + 0.35rem);
  font-size: 0.6875rem;
  font-weight: 700;
  white-space: nowrap;
  opacity: var(--grow);
  font-variant-numeric: tabular-nums;
}

.chart-tip {
  position: absolute;
  left: calc(var(--x) * 100%);
  bottom: calc(var(--h) * 100% + 0.5rem);
  z-index: 1;
  display: grid;
  gap: 0.1rem;
  padding: 0.4rem 0.65rem;
  border-radius: 0.6rem;
  translate: -50% 0;
  background: var(--color-paper);
  color: var(--color-ink);
  white-space: nowrap;
  pointer-events: none;

  b {
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }

  span {
    font-size: 0.6875rem;
    color: rgb(17 17 19 / 0.6);
  }
}

.chart-axis {
  display: grid;
  grid-template-columns: repeat(var(--count), 1fr);
  margin-top: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  color: rgb(242 241 237 / 0.55);

  > span {
    display: grid;
    gap: 0.3rem;
  }

  b {
    color: var(--color-paper);
    font-variant-numeric: tabular-nums;
  }
}

.install {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.6rem 0.5rem 1rem;
  border-radius: 99px;
  background: rgb(242 241 237 / 0.08);
  box-shadow: inset 0 0 0 1px rgb(242 241 237 / 0.12);
  transition: background-color 0.3s;

  code {
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.8125rem;
  }

  @include hover {
    background: rgb(242 241 237 / 0.14);
  }
}
</style>
