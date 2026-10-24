<script setup lang="ts">
import { gsap } from 'gsap'
import { projects } from '~/data/projects'
import { site } from '~/data/site'

const { t } = useI18n()

const root = useTemplateRef<HTMLElement>('root')
const count = useTemplateRef<HTMLElement>('count')
const github = site.github

// the number in "(04)": Vue renders it, the intro only counts it up. Written straight into the DOM
// it got stuck at "(00)" whenever the intro was reverted mid-way (a breakpoint change, a hot reload),
// because Vue saw no change to re-render
const shown = ref(projects.length)

useSectionSpy(root, 'projects')

useGsap(({ reduceMotion }) => {
  const el = root.value
  if (!el || reduceMotion) return

  const counter = { value: 0 }
  gsap.to(counter, {
    value: projects.length,
    duration: 1.2,
    ease: 'power2.out',
    snap: { value: 1 },
    scrollTrigger: { trigger: count.value, start: 'top 85%', once: true },
    onUpdate: () => {
      shown.value = counter.value
    },
  })

  const stack = el.querySelector<HTMLElement>('.stack')!
  const items = gsap.utils.toArray<HTMLElement>('.stack-item', stack)
  const offsetOf = (index: number) => items
    .slice(0, index)
    .reduce((sum, item) => sum + item.offsetHeight + parseFloat(getComputedStyle(item).marginBottom), 0)
  const stickyTop = (item: HTMLElement) => parseFloat(getComputedStyle(item).top)
  const slot = (index: number, from: string, to: string | ((item: HTMLElement) => string)) => ({
    trigger: stack,
    start: () => `top+=${offsetOf(index)} ${from}`,
    end: () => `top+=${offsetOf(index)} ${typeof to === 'function' ? to(items[index]!) : to}`,
    scrub: true,
    invalidateOnRefresh: true,
  })

  items.forEach((item, index) => {
    if (index === items.length - 1) return

    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        ...slot(index + 1, 'bottom', next => `${stickyTop(next)}px`),
        onLeave: () => item.toggleAttribute('data-covered', true),
        onEnterBack: () => item.toggleAttribute('data-covered', false),
      },
    })
      .to(item.querySelector('.project-card'), { scale: 0.92, transformOrigin: '50% 0%' }, 0)
      .to(item.querySelector('.project-shade'), { opacity: 0.45 }, 0)
  })

  return () => {
    shown.value = projects.length
  }
}, root)
</script>

<template>
  <section
    id="projects"
    ref="root"
    class="relative pt-[clamp(5rem,11vw,11rem)] pb-[clamp(4rem,8vw,8rem)]"
  >
    <div class="container-site">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <h2 class="type-h2 relative pr-[0.8em]">
          <FxReveal
            :text="t('projects.title')"
            by="chars"
          />
          <sup
            ref="count"
            class="absolute top-[0.05em] right-0 font-display text-[0.26em] font-semibold tracking-normal text-signal"
          >({{ String(shown).padStart(2, '0') }})</sup>
        </h2>
        <a
          :href="github"
          target="_blank"
          rel="noopener"
          class="group inline-flex min-h-11 items-center gap-2 pb-2 text-[0.9375rem] font-semibold text-signal"
        >
          {{ t('projects.more') }}
          <FxArrow />
        </a>
      </div>

      <div class="stack mt-[clamp(2.5rem,5vw,5rem)] pb-[8vh]">
        <div
          v-for="(project, index) in projects"
          :key="project.slug"
          v-pause-offscreen
          class="stack-item sticky mb-[6vh] h-[min(86svh,54rem)] last:mb-0"
          :style="{ top: `calc(var(--header-h) + ${index * 1.25}rem)` }"
        >
          <ProjectCard
            :project="project"
            :index="index"
            :total="projects.length"
          />
        </div>
      </div>
    </div>
  </section>
</template>
