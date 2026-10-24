<script setup lang="ts">
import { gsap } from 'gsap'
import { isDarkTone, toneClasses } from '~/data/projects'
import type { Project } from '~/data/projects'

const props = defineProps<{
  project: Project
  index: number
  total: number
}>()

const { t } = useI18n()
const tList = useTList()
const ui = useUiStore()

const key = (field: string) => `projects.items.${props.project.slug}.${field}`
const pad = (value: number) => String(value).padStart(2, '0')
const facts = computed(() => tList(key('facts')))
const dark = computed(() => isDarkTone(props.project.tone))
// sand turns into a dark plane with the dark theme (see toneClasses), so its type follows the theme
const themed = computed(() => props.project.tone === 'sand')
const glassTone = computed(() => {
  if (dark.value) return 'glass-on-dark text-white'
  return themed.value ? 'glass-on-light text-ink dark:text-paper' : 'glass-on-light text-ink'
})
// a screenshot fills the whole card under the copy; a CSS scene gets the side of the card the copy leaves free
const shot = computed(() => Boolean(props.project.image))

// only the card being opened (or returned to) is named, so it morphs into the case page hero
const morph = computed(() => ui.transitionSlug === props.project.slug)

// a ref on NuxtLink is the component instance; its $el is the <a>
const link = useTemplateRef('link')
const linkEl = () => link.value?.$el as HTMLElement | undefined
const media = useTemplateRef<HTMLElement>('media')
const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')

// The screenshot leans a little after the pointer (it is drawn a touch larger than the card, so its
// edges never show); a CSS scene drifts layer by layer instead, like a diorama. No zoom either way.
function onMove(event: PointerEvent) {
  const el = linkEl()
  if (!el || !canHover.value) return
  const rect = el.getBoundingClientRect()
  const nx = (event.clientX - rect.left) / rect.width - 0.5
  const ny = (event.clientY - rect.top) / rect.height - 0.5
  if (shot.value) {
    gsap.to(media.value, { x: nx * -18, y: ny * -12, duration: 1.1, ease: 'power3.out', overwrite: 'auto' })
    return
  }
  gsap.utils.toArray<HTMLElement>('[data-depth]', el).forEach((layer) => {
    const depth = Number(layer.dataset.depth)
    gsap.to(layer, { x: nx * depth * 46, y: ny * depth * 34, duration: 0.9, ease: 'power3.out', overwrite: 'auto' })
  })
}

function onLeave() {
  const el = linkEl()
  if (!el) return
  gsap.to([media.value, ...gsap.utils.toArray('[data-depth]', el)], { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
}
</script>

<template>
  <NuxtLink
    ref="link"
    :to="`/projects/${project.slug}`"
    class="project-card group relative block h-full overflow-hidden rounded-card"
    :class="[toneClasses[project.tone], { 'has-shot': shot }]"
    data-cursor="view"
    @click="ui.transitionSlug = project.slug"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <!-- the picture; named while the card morphs into the case page's stage -->
    <div
      class="project-stage absolute overflow-hidden"
      :style="morph ? { viewTransitionName: `project-${project.slug}` } : undefined"
    >
      <div
        ref="media"
        class="project-media skip-offscreen absolute"
      >
        <ProjectMedia
          :project="project"
          sizes="(min-width: 64rem) 92vw, 100vw"
        />
        <!--
          Progressive blur without a backdrop filter: three copies of the (small) screenshot, blurred
          once by a static filter and masked in one below the other — sharp at the top, deep at the
          bottom where the copy sits. Static filters are rasterised once; a stack of backdrop filters
          would re-filter on every frame of the stack's scroll.
        -->
        <template v-if="project.image">
          <span
            v-for="level in 3"
            :key="level"
            class="project-blur"
            :class="`is-${level}`"
            aria-hidden="true"
          >
            <img
              :src="withBase(`/images/projects/${project.image}-640.webp`)"
              alt=""
              loading="lazy"
              decoding="async"
            >
          </span>
        </template>
      </div>
      <span
        v-if="project.image"
        class="project-veil"
        aria-hidden="true"
      />
    </div>

    <div class="project-copy relative z-10 flex h-full flex-col justify-between gap-6 p-[clamp(1.25rem,2.6vw,2.75rem)]">
      <div class="flex items-start justify-between gap-6">
        <p class="flex items-start gap-1 font-display leading-none font-semibold tracking-[-0.04em]">
          <span class="text-[clamp(2.5rem,4.4vw,4.5rem)]">{{ pad(index + 1) }}</span>
          <span class="mt-[0.35em] text-sm opacity-60">/ {{ pad(total) }}</span>
        </p>
        <!-- flat glass: a live backdrop over a moving picture would re-filter every frame -->
        <ul class="pointer-events-none hidden flex-col items-end gap-2 sm:flex">
          <li
            v-for="(fact, factIndex) in facts"
            :key="fact"
            class="project-fact liquid-glass glass-flat rounded-full px-3.5 py-1.5 text-[0.8125rem] font-semibold whitespace-nowrap"
            :class="glassTone"
            :style="{ '--fact': factIndex }"
          >
            {{ fact }}
          </li>
        </ul>
      </div>

      <div class="max-w-152">
        <p class="type-overline flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem]">
          <span class="opacity-70">{{ t(key('type')) }}</span>
          <span class="rounded-full border border-current/25 px-2.5 py-0.5 tracking-normal normal-case">{{ t(key('status')) }}</span>
        </p>
        <h3
          class="mt-3 font-display text-[clamp(2.25rem,5vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.045em]"
          :style="morph ? { viewTransitionName: `project-title-${project.slug}` } : undefined"
        >
          {{ t(key('title')) }}
        </h3>
        <p class="mt-4 max-w-md text-[0.9375rem] leading-relaxed opacity-80">
          {{ t(key('summary')) }}
        </p>
        <span class="mt-6 inline-flex items-center gap-3 text-sm font-semibold">
          <span
            class="grid size-12 place-items-center rounded-full border border-current/30 transition-colors duration-500 group-hover:border-transparent"
            :class="dark ? 'group-hover:bg-signal group-hover:text-ink' : ['group-hover:bg-ink group-hover:text-paper', { 'dark:group-hover:bg-signal dark:group-hover:text-ink': themed }]"
          >
            <FxArrow class="size-4.5" />
          </span>
          {{ t('projects.view') }}
        </span>
      </div>
    </div>

    <!-- dims the card as the next one slides over it -->
    <span
      class="project-shade pointer-events-none absolute inset-0 z-20 bg-ink opacity-0"
      aria-hidden="true"
    />
  </NuxtLink>
</template>

<style scoped lang="scss">
// how far the blur sinks under the pointer (registered, so the masks can transition)
@property --lift {
  syntax: "<percentage>";
  inherits: true;
  initial-value: 0%;
}

.project-card {
  --lift: 0%;

  transition: --lift 0.9s var(--ease-out-expo);

  @include hover {
    --lift: 12%;
  }
}

/* a scene card: the scene takes the right side on desktop, the top on phones; the copy has the rest */
.project-stage {
  inset: 0 0 48% 0;

  @include up(lg) {
    inset: 0 0 0 40%;
  }
}

.has-shot .project-stage {
  inset: 0;
}

.project-media {
  inset: 0;
}

// a touch larger than the card, so the pointer lean never shows an edge
.has-shot .project-media {
  inset: -2%;
  will-change: transform;
}

.project-blur {
  position: absolute;
  inset: 0;
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    // blurring pulls transparency in at the edges: a slightly larger copy keeps the fringe outside
    scale: 1.08;
  }

  &.is-1 {
    mask-image: linear-gradient(to bottom, transparent calc(34% + var(--lift)), #000 calc(56% + var(--lift)));

    img {
      filter: blur(6px);
    }
  }

  &.is-2 {
    mask-image: linear-gradient(to bottom, transparent calc(48% + var(--lift)), #000 calc(72% + var(--lift)));

    img {
      filter: blur(16px);
    }
  }

  &.is-3 {
    mask-image: linear-gradient(to bottom, transparent calc(62% + var(--lift)), #000 calc(90% + var(--lift)));

    img {
      filter: blur(34px) saturate(1.2);
    }
  }
}

// keeps the copy readable over any screenshot: deep at the bottom-left, and a softer pool at the
// top-right corner where the fact chips sit over the screenshot's own UI
.project-veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to top, rgb(17 17 19 / 0.88), rgb(17 17 19 / 0.45) 38%, transparent 62%),
    linear-gradient(to right, rgb(17 17 19 / 0.55), transparent 55%),
    radial-gradient(ellipse 34% 30% at 100% 0%, rgb(17 17 19 / 0.6), transparent);
}

/* the chips bob a little, out of step with each other */
.project-fact {
  animation: bob 5s ease-in-out infinite alternate;
  animation-delay: calc(var(--fact) * -1.7s);
}

@keyframes bob {
  to {
    translate: -0.4rem 0.35rem;
  }
}

@include reduced-motion {
  .project-fact {
    animation: none;
  }
}
</style>
