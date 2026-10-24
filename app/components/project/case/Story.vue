<script setup lang="ts">
import { gsap } from 'gsap'
import type { Project } from '~/data/projects'

const props = defineProps<{ project: Project }>()

const { t } = useI18n()
const key = (field: string) => `projects.items.${props.project.slug}.${field}`

const root = useTemplateRef<HTMLElement>('root')

useGsap(({ reduceMotion }) => {
  if (reduceMotion) return
  gsap.utils.toArray<HTMLElement>('.case-block', root.value).forEach((block) => {
    gsap.from(block, { y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: block, start: 'top 85%', once: true } })
  })
}, root)
</script>

<template>
  <!-- the summary, then the problem and how it was solved -->
  <section
    ref="root"
    class="container-site grid gap-x-(--col-gap) gap-y-16 py-[clamp(5rem,10vw,10rem)] lg:grid-cols-12"
  >
    <p class="case-block type-lead text-[clamp(1.25rem,2vw,1.75rem)] leading-snug font-medium lg:col-span-7">
      {{ t(key('summary')) }}
    </p>
    <div class="grid gap-12 lg:col-span-12 lg:grid-cols-2">
      <div class="case-block">
        <p class="type-overline text-signal">
          {{ t('project.challenge') }}
        </p>
        <p class="type-lead mt-4 text-muted-foreground">
          {{ t(key('challenge')) }}
        </p>
      </div>
      <div class="case-block">
        <p class="type-overline text-signal">
          {{ t('project.solution') }}
        </p>
        <p class="type-lead mt-4 text-muted-foreground">
          {{ t(key('solution')) }}
        </p>
      </div>
    </div>
  </section>
</template>
