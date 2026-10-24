<script setup lang="ts">
import { demoLink } from '~/data/projects'

const { project, next } = useProjectCase('spritecutter')
const demo = demoLink(project)!
</script>

<template>
  <main class="pt-[calc(var(--header-h)+clamp(1.5rem,4vw,3rem))]">
    <ProjectCaseHero :project="project" />
    <ProjectCaseStage :project="project" />
    <ProjectCaseStory :project="project" />
    <!-- after the problem and the approach: now try the tool itself -->
    <ProjectCaseDemo
      :project="project"
      :src="demo"
      ratio="16 / 10"
      allow="fullscreen; clipboard-write"
    />
    <div class="h-[clamp(4rem,8vw,8rem)]" />
    <ProjectCaseNext :project="next" />
  </main>
</template>
