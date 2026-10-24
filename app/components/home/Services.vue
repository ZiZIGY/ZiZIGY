<script setup lang="ts">
import { gsap } from 'gsap'

const { t } = useI18n()
const tList = useTList()

const root = useTemplateRef<HTMLElement>('root')

useSectionSpy(root, 'services')

// the three services, each a tile with something to play with
const services = ['frontend', 'motion', 'complex'] as const

useGsap(({ reduceMotion }) => {
  const el = root.value
  if (!el || reduceMotion) return

  // the tiles rise into the bento with the scroll, the later ones from a little further down
  gsap.utils.toArray<HTMLElement>('.tile', el).forEach((tile, index) => {
    gsap.fromTo(tile, { y: 70 + (index % 3) * 35 }, {
      y: 0,
      ease: 'none',
      scrollTrigger: { trigger: tile, start: 'top bottom', end: 'top 62%', scrub: true },
    })
  })
}, root)
</script>

<template>
  <section
    id="services"
    ref="root"
    v-pause-offscreen
    class="relative py-[clamp(5rem,11vw,11rem)]"
  >
    <div class="container-site">
      <div class="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-(--col-gap)">
        <div class="lg:col-span-7">
          <p class="type-overline text-signal">
            {{ t('services.overline') }}
          </p>
          <h2 class="type-h1 mt-5">
            <FxReveal
              :text="t('services.title')"
              by="chars"
            />
          </h2>
        </div>
        <FxReveal
          as="p"
          :text="t('services.intro')"
          by="lines"
          class="type-lead max-w-xl text-muted-foreground lg:col-span-5 lg:justify-self-end"
        />
      </div>

      <div class="mt-[clamp(3rem,6vw,5.5rem)] grid gap-3 lg:grid-cols-12 lg:gap-4">
        <article
          v-for="(id, index) in services"
          :key="id"
          class="tile tile-service"
          :class="`is-${id}`"
        >
          <header>
            <div class="flex items-center justify-between gap-4">
              <span class="font-display text-sm font-semibold text-signal">{{ String(index + 1).padStart(2, '0') }}</span>
              <ul class="flex flex-wrap justify-end gap-1.5">
                <li
                  v-for="tag in tList(`services.items.${id}.tags`)"
                  :key="tag"
                  class="tile-tag"
                >
                  {{ tag }}
                </li>
              </ul>
            </div>
            <h3 class="tile-title mt-5">
              {{ t(`services.items.${id}.title`) }}
            </h3>
            <p class="tile-text mt-3">
              {{ t(`services.items.${id}.text`) }}
            </p>
          </header>

          <div class="mt-8">
            <HomeServicesCodeDemo v-if="id === 'frontend'" />
            <HomeServicesCurveDemo v-else-if="id === 'motion'" />
            <HomeServicesBoardDemo v-else />
          </div>
        </article>

        <article class="tile tile-extra is-ai">
          <div>
            <h3 class="tile-title-sm">
              {{ t('services.extras.ai.title') }}
            </h3>
            <p class="tile-text mt-2">
              {{ t('services.extras.ai.text') }}
            </p>
          </div>
          <HomeServicesAgentDemo class="mt-6" />
        </article>

        <article class="tile tile-extra is-realtime">
          <div>
            <h3 class="tile-title-sm">
              {{ t('services.extras.realtime.title') }}
            </h3>
            <p class="tile-text mt-2">
              {{ t('services.extras.realtime.text') }}
            </p>
          </div>
          <HomeServicesLiveChart class="mt-6" />
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.tile {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(1.25rem, 2.4vw, 2.25rem);
  border-radius: var(--radius-card);
  background: var(--card);
  box-shadow: inset 0 0 0 1px var(--border);
}

// the frontend tile is the big one, on ink
.tile-service {
  @include up(lg) {
    grid-column: span 5;
  }

  &.is-frontend {
    background: var(--color-ink);
    color: var(--color-paper);
    box-shadow: none;

    @include up(lg) {
      grid-column: span 7;
    }

    @include dark {
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1);
    }

    .tile-text {
      color: rgb(242 241 237 / 0.7);
    }

    .tile-tag {
      background: rgb(255 255 255 / 0.08);
      box-shadow: none;
    }
  }
}

.tile-extra {
  background: var(--secondary);
  box-shadow: none;

  &.is-ai {
    @include up(lg) {
      grid-column: span 3;
    }
  }

  &.is-realtime {
    @include up(lg) {
      grid-column: span 4;
    }
  }
}

.tile-title {
  max-width: 18ch;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.5vw, 2.5rem);
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -0.035em;
}

.tile-title-sm {
  font-family: var(--font-display);
  font-size: clamp(1.125rem, 1.5vw, 1.4rem);
  font-weight: 600;
  letter-spacing: -0.03em;
}

.tile-text {
  max-width: 34rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--muted-foreground);
}

.tile-tag {
  padding: 0.3rem 0.75rem;
  border-radius: 99px;
  box-shadow: inset 0 0 0 1px var(--border);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
