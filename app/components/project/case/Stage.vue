<script setup lang="ts">
import { gsap } from 'gsap'
import { isDarkTone, toneClasses } from '~/data/projects'
import type { Project } from '~/data/projects'

const props = defineProps<{ project: Project }>()

const tList = useTList()
const facts = computed(() => tList(`projects.items.${props.project.slug}.facts`))
// sand turns dark with the dark theme (see toneClasses), so its type follows the theme
const factTone = isDarkTone(props.project.tone)
  ? 'glass-on-dark text-white'
  : `glass-on-light text-ink${props.project.tone === 'sand' ? ' dark:text-paper' : ''}`

const root = useTemplateRef<HTMLElement>('root')

// the scene sinks a little slower than the page as you scroll past it (a drift, no zoom)
useGsap(({ reduceMotion }) => {
  if (reduceMotion) return
  gsap.to('.case-stage-inner', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true },
  })
}, root)
</script>

<template>
  <section
    v-pause-offscreen
    class="container-site mt-[clamp(2rem,4vw,3.5rem)]"
  >
    <!-- named like the clicked card's visual, so the card morphs into this stage -->
    <div
      ref="root"
      class="relative h-[min(78svh,52rem)] overflow-hidden rounded-card"
      :class="toneClasses[project.tone]"
      :style="{ viewTransitionName: `project-${project.slug}` }"
    >
      <div class="case-stage-inner skip-offscreen absolute inset-0">
        <ProjectMedia
          :project="project"
          sizes="92vw"
          eager
        />
      </div>
      <ul class="pointer-events-none absolute top-[clamp(1rem,2.5vw,2rem)] right-[clamp(1rem,2.5vw,2rem)] flex flex-col items-end gap-2">
        <li
          v-for="fact in facts"
          :key="fact"
          class="liquid-glass glass-flat rounded-full px-4 py-2 text-sm font-semibold"
          :class="factTone"
        >
          {{ fact }}
        </li>
      </ul>
    </div>
  </section>
</template>
