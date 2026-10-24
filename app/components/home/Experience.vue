<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experience } from '~/data/experience'
import type { Experience } from '~/data/experience'

const { t } = useI18n()
const tList = useTList()

const root = useTemplateRef<HTMLElement>('root')
const list = useTemplateRef<HTMLElement>('list')

useSectionSpy(root, 'experience')

const active = ref(0)
const current = computed(() => experience[active.value]!)

const startYear = (item: Experience) => Number(item.from.slice(0, 4))
const endYear = (item: Experience) => (item.to ? item.to.slice(0, 4) : t('experience.now'))

useGsap(({ reduceMotion }) => {
  const el = list.value
  if (!el) return
  const rows = gsap.utils.toArray<HTMLElement>('.exp-row', el)

  rows.forEach((row, index) => {
    ScrollTrigger.create({
      trigger: row,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (self.isActive) active.value = index
      },
    })
  })

  if (reduceMotion) return

  gsap.fromTo('.exp-rail-fill', { scaleY: 0 }, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 55%', end: 'bottom 55%', scrub: true },
  })
  rows.forEach((row) => {
    gsap.fromTo(row.querySelector('.exp-rule'), { scaleX: 0 }, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: row, start: 'top 95%', end: 'top 55%', scrub: true },
    })
  })
}, root)
</script>

<template>
  <section
    id="experience"
    ref="root"
    v-pause-offscreen
    class="py-[clamp(5rem,11vw,11rem)]"
  >
    <div class="container-site">
      <div class="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-(--col-gap)">
        <div>
          <p class="type-overline text-signal">
            {{ t('experience.overline') }}
          </p>
          <h2 class="type-h2 mt-6">
            <FxReveal
              :text="t('experience.title')"
              by="words"
            />
          </h2>
        </div>
        <FxReveal
          as="p"
          :text="t('experience.text')"
          by="lines"
          class="type-lead max-w-xl text-muted-foreground lg:justify-self-end"
        />
      </div>

      <div class="mt-[clamp(3rem,6vw,6rem)] grid lg:grid-cols-12 lg:gap-(--col-gap)">
        <!-- the year being read, big and sticky; it rolls whenever another row comes into focus -->
        <aside
          class="hidden @container lg:col-span-4 lg:block"
          aria-hidden="true"
        >
          <div class="sticky top-[calc(var(--header-h)+2rem)]">
            <p class="exp-year">
              <FxOdometer
                :value="startYear(current)"
                :group="false"
                :roll-in="false"
              />
            </p>
            <Transition
              name="exp-swap"
              mode="out-in"
            >
              <div
                :key="current.id"
                class="mt-5"
              >
                <p class="font-display text-[clamp(1.25rem,1.8vw,1.75rem)] font-semibold tracking-[-0.03em]">
                  — {{ endYear(current) }}
                </p>
                <p class="mt-2 text-[0.9375rem] text-muted-foreground">
                  {{ t(`experience.items.${current.id}.company`) }}
                </p>
              </div>
            </Transition>
            <ol class="mt-8 flex max-w-xs gap-1.5">
              <li
                v-for="(item, index) in experience"
                :key="item.id"
                class="exp-step"
                :class="{ 'is-on': index <= active }"
              />
            </ol>
          </div>
        </aside>

        <ol
          ref="list"
          class="exp-list relative lg:col-span-8"
        >
          <span
            class="exp-rail"
            aria-hidden="true"
          >
            <span class="exp-rail-fill" />
          </span>

          <li
            v-for="(item, index) in experience"
            :key="item.id"
            class="exp-row"
            :class="{ 'is-active': index === active, 'is-past': index < active }"
          >
            <span
              class="exp-rule"
              aria-hidden="true"
            />
            <span
              class="exp-node"
              aria-hidden="true"
            />
            <div class="flex items-baseline justify-between gap-4">
              <span class="exp-index font-display text-sm font-semibold">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="font-display text-sm font-semibold tracking-wide">
                {{ startYear(item) }} — {{ endYear(item) }}
              </span>
            </div>
            <div class="exp-body">
              <h3 class="mt-5 font-display text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
                {{ t(`experience.items.${item.id}.company`) }}
              </h3>
              <p class="mt-2 text-[0.9375rem] text-muted-foreground">
                {{ t(`experience.items.${item.id}.role`) }}
              </p>
              <ul class="mt-6 grid gap-3 xl:grid-cols-3 xl:gap-6">
                <li
                  v-for="line in tList(`experience.items.${item.id}.highlights`)"
                  :key="line"
                  class="exp-point text-[0.9375rem] leading-snug"
                >
                  {{ line }}
                </li>
              </ul>
              <ul class="mt-6 flex flex-wrap gap-1.5">
                <li
                  v-for="tech in item.stack"
                  :key="tech"
                  class="rounded-full border px-3 py-1 text-[0.75rem] font-medium"
                >
                  {{ tech }}
                </li>
              </ul>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
// four digits that fill the sticky column and never more
.exp-year {
  font-family: var(--font-display);
  font-size: min(32cqi, 11rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.06em;
}

// the old company steps out quickly so the new one arrives together with the rolling year
.exp-swap-enter-active {
  transition: opacity 0.35s, translate 0.5s var(--ease-out-expo);
}

.exp-swap-leave-active {
  transition: opacity 0.15s, translate 0.15s ease-in;
}

.exp-swap-enter-from {
  opacity: 0;
  translate: 0 0.75rem;
}

.exp-swap-leave-to {
  opacity: 0;
  translate: 0 -0.5rem;
}

.exp-step {
  flex: 1;
  height: 0.25rem;
  border-radius: 99px;
  background: var(--border);
  transition: background-color 0.5s;

  &.is-on {
    background: var(--color-signal);
  }
}

// the rail runs down the left edge of the list; its fill is the only thing scrubbed per frame
.exp-rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0.3rem;
  width: 1px;
  background: var(--border);
}

.exp-rail-fill {
  position: absolute;
  inset: 0;
  background: var(--color-signal);
  transform-origin: top;
  will-change: transform;
}

.exp-row {
  position: relative;
  padding: clamp(1.75rem, 3vw, 2.75rem) 0 clamp(1.75rem, 3vw, 2.75rem) clamp(2rem, 3.5vw, 3.25rem);
}

.exp-rule {
  position: absolute;
  top: 0;
  right: 0;
  left: clamp(2rem, 3.5vw, 3.25rem);
  height: 1px;
  background: var(--border);
  transform-origin: left;
}

.exp-node {
  position: absolute;
  top: clamp(1.75rem, 3vw, 2.75rem);
  left: 0;
  width: 0.65rem;
  height: 0.65rem;
  margin-top: 0.3em;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--background);
  transition: background-color 0.4s, border-color 0.4s, scale 0.5s var(--ease-spring);
}

.exp-index {
  color: var(--muted-foreground);
  transition: color 0.4s;
}

// focus: the row being read is full strength, the others step back
.exp-body {
  opacity: 0.38;
  transition: opacity 0.5s;
}

.exp-row.is-past .exp-node {
  border-color: var(--color-signal);
  background: var(--color-signal);
}

.exp-row.is-active {
  .exp-body {
    opacity: 1;
  }

  .exp-index {
    color: var(--color-signal);
  }

  .exp-node {
    border-color: var(--color-signal);
    background: var(--color-signal);
    scale: 1.5;
  }
}

.exp-point {
  position: relative;
  padding-left: 1.1rem;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.5em;
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: var(--color-signal);
  }
}

@include reduced-motion {
  .exp-body {
    opacity: 1;
  }
}
</style>
