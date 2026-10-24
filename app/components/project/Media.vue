<script setup lang="ts">
import { imageSources } from '~/data/projects'
import type { Project } from '~/data/projects'

/** A project's picture: its real screenshot when there is one, otherwise its CSS scene. */
const props = withDefaults(defineProps<{
  project: Project
  /** `sizes` for the screenshot's srcset. */
  sizes?: string
  eager?: boolean
}>(), { sizes: '100vw', eager: false })

const { t } = useI18n()
const sources = computed(() => (props.project.image ? imageSources(props.project.image) : []))
</script>

<template>
  <picture
    v-if="project.image"
    class="block size-full"
  >
    <source
      v-for="source in sources"
      :key="source.type"
      :type="source.type"
      :srcset="source.srcset"
      :sizes="sizes"
    >
    <img
      :src="withBase(`/images/projects/${project.image}-1200.webp`)"
      :alt="t(`projects.items.${project.slug}.title`)"
      width="1920"
      height="1020"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      class="size-full object-cover object-top"
    >
  </picture>
  <ProjectVisual
    v-else
    :visual="project.visual"
  />
</template>
