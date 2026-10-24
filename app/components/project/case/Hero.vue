<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { gsap } from 'gsap'
import type { Project } from '~/data/projects'

const props = defineProps<{ project: Project }>()

const { t } = useI18n()
const key = (field: string) => `projects.items.${props.project.slug}.${field}`

const meta = computed(() => [
  { label: t('project.type'), value: t(key('type')) },
  { label: t('project.status'), value: t(key('status')) },
  { label: t('project.role'), value: t(key('role')) },
  { label: t('project.stack'), value: t(key('stack')) },
])

const root = useTemplateRef<HTMLElement>('root')

useGsap(({ reduceMotion }) => {
  if (reduceMotion) return
  gsap.from('.case-meta > *', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.35 })
  // glass buttons rise and grow instead of fading (a fading parent would blank the glass); closed projects have none
  if (props.project.links.length) {
    gsap.from('.case-links > *', { y: 24, scale: 0.85, duration: 1, ease: 'back.out(1.8)', stagger: 0.08, delay: 0.6 })
  }
}, root)
</script>

<template>
  <section
    ref="root"
    class="container-site"
  >
    <NuxtLink
      to="/#projects"
      class="liquid-glass glass-on-light group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
    >
      <ArrowLeft class="size-4 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />
      {{ t('project.back') }}
    </NuxtLink>

    <!-- the title gets a row of its own: a one-word name at display size is wider than any column;
         it carries the name the clicked card's title had, so the card morphs straight into it -->
    <h1
      class="type-h1 mt-8 text-balance"
      :style="{ viewTransitionName: `project-title-${project.slug}` }"
    >
      {{ t(key('title')) }}
    </h1>

    <div class="mt-[clamp(2rem,4vw,3.5rem)] grid gap-8 border-t pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <dl class="case-meta grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
        <div
          v-for="item in meta"
          :key="item.label"
        >
          <dt class="type-overline text-[0.75rem] text-muted-foreground">
            {{ item.label }}
          </dt>
          <dd class="mt-1.5 text-[0.9375rem] font-medium">
            {{ item.value }}
          </dd>
        </div>
      </dl>
      <div
        v-if="project.links.length"
        class="case-links flex flex-wrap gap-2"
      >
        <Button
          v-for="link in project.links"
          :key="link.href"
          as="a"
          :href="link.href"
          target="_blank"
          rel="noopener"
          variant="glass"
          size="pill"
          class="glass-on-light font-semibold"
        >
          {{ t(`project.${link.kind}`) }}
          <FxArrow />
        </Button>
      </div>
    </div>
  </section>
</template>
