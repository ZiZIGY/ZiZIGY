<script setup lang="ts">
import { gsap } from 'gsap'
import { toneClasses } from '~/data/projects'
import type { Project } from '~/data/projects'

const props = defineProps<{ project: Project }>()

const { t } = useI18n()
const ui = useUiStore()

// once clicked, this link carries the names of the next case's hero, so it morphs straight into it
const morph = computed(() => ui.transitionSlug === props.project.slug)

const root = useTemplateRef<HTMLElement>('root')

useGsap(({ reduceMotion }) => {
  if (reduceMotion) return
  gsap.fromTo('.case-next-stage', { clipPath: 'inset(18% 10% 0% 10% round 2rem)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 1.75rem)',
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom bottom', scrub: true },
  })
}, root)
</script>

<template>
  <section
    ref="root"
    v-pause-offscreen
    class="container-site pb-[clamp(3rem,6vw,6rem)]"
  >
    <NuxtLink
      :to="`/projects/${project.slug}`"
      class="group block"
      data-cursor="view"
      :data-cursor-label="t('cursor.next')"
      @click="ui.transitionSlug = project.slug"
    >
      <p class="type-overline text-muted-foreground">
        {{ t('project.next') }}
      </p>
      <!-- a notch under type-h1 on phones: a one-word name plus the arrow must fit 360px -->
      <div class="mt-4 flex items-end justify-between gap-3 sm:gap-6">
        <span
          class="type-h1 min-w-0 text-[clamp(2rem,7.4vw,9.5rem)] transition-colors duration-500 group-hover:text-signal"
          :style="morph ? { viewTransitionName: `project-title-${project.slug}` } : undefined"
        >{{ t(`projects.items.${project.slug}.title`) }}</span>
        <FxArrow class="mb-[1vw] size-[clamp(2rem,5vw,4.5rem)] shrink-0" />
      </div>
      <div
        class="case-next-stage relative mt-8 h-[min(56svh,36rem)] overflow-hidden rounded-card"
        :class="toneClasses[project.tone]"
        :style="morph ? { viewTransitionName: `project-${project.slug}` } : undefined"
      >
        <div class="skip-offscreen absolute inset-0">
          <ProjectMedia
            :project="project"
            sizes="92vw"
          />
        </div>
      </div>
    </NuxtLink>
  </section>
</template>
