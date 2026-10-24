<script setup lang="ts">
import { Play } from '@lucide/vue'
import { gsap } from 'gsap'
import type { Project } from '~/data/projects'

const props = withDefaults(defineProps<{
  project: Project
  /** The page to embed. */
  src: string
  /** Frame proportions, as CSS aspect-ratio. */
  ratio?: string
  /** What the frame needs from the browser (Permissions Policy). */
  allow?: string
}>(), { ratio: '16 / 9', allow: 'fullscreen; autoplay; gamepad' })

const { t } = useI18n()

// the demo is a whole app: it loads only when asked for, so the case page itself stays light
const running = ref(false)
const host = computed(() => new URL(props.src).host)

const root = useTemplateRef<HTMLElement>('root')

useGsap(({ reduceMotion }) => {
  if (reduceMotion) return
  gsap.from('.demo-frame', {
    y: 60,
    scale: 0.96,
    duration: 1.2,
    ease: 'expo.out',
    scrollTrigger: { trigger: root.value, start: 'top 85%', once: true },
  })
}, root)
</script>

<template>
  <section
    ref="root"
    v-pause-offscreen
    class="container-site mt-[clamp(3rem,6vw,5rem)]"
  >
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="type-overline text-signal">
          {{ t('project.demoOverline') }}
        </p>
        <h2 class="mt-3 font-display text-[clamp(1.5rem,3vw,2.75rem)] leading-tight font-semibold tracking-[-0.035em]">
          {{ t('project.demoTitle', { name: t(`projects.items.${project.slug}.title`) }) }}
        </h2>
      </div>
      <a
        :href="src"
        target="_blank"
        rel="noopener"
        class="group inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold"
      >
        {{ t('project.demoOpen') }}
        <FxArrow />
      </a>
    </div>

    <div
      class="demo-frame relative mt-6 overflow-hidden rounded-card bg-ink text-paper dark:ring-1 dark:ring-white/10"
      :style="{ aspectRatio: ratio }"
    >
      <iframe
        v-if="running"
        :src="src"
        :title="t(`projects.items.${project.slug}.title`)"
        :allow="allow"
        class="absolute inset-0 size-full border-0"
      />
      <button
        v-else
        type="button"
        class="demo-poster absolute inset-0 grid place-items-center"
        data-cursor="play"
        :data-cursor-label="t('cursor.run')"
        @click="running = true"
      >
        <!-- the project's screenshot, dimmed and softened, so the poster already looks like the thing -->
        <img
          v-if="project.image"
          :src="withBase(`/images/projects/${project.image}-1200.webp`)"
          alt=""
          loading="lazy"
          decoding="async"
          class="demo-shot absolute inset-0 size-full object-cover object-top"
        >
        <span
          class="demo-grid absolute inset-0"
          aria-hidden="true"
        />
        <!-- the note sits under the button, clear of the corner where the floating to-top button lives -->
        <span class="relative grid justify-items-center gap-3">
          <span class="inline-flex h-14 items-center gap-3 rounded-full bg-signal px-7 font-semibold text-ink">
            <Play class="size-4 fill-current" />
            {{ t('project.demoRun') }}
          </span>
          <span class="text-sm text-paper/60">{{ t('project.demoNote') }}</span>
        </span>
        <span class="absolute bottom-5 left-6 font-display text-sm font-semibold text-paper/50">{{ host }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.demo-shot {
  filter: blur(3px) brightness(0.42) saturate(1.1);
  scale: 1.04;
}

.demo-grid {
  background-image:
    linear-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.06) 1px, transparent 1px),
    radial-gradient(circle at 50% 60%, rgb(255 79 26 / 0.35), transparent 60%);
  background-size: 4rem 4rem, 4rem 4rem, 100% 100%;
}
</style>
