<script setup lang="ts">
import { demoLink } from '~/data/projects'

const { project, next } = useProjectCase('wispbringer')
const demo = demoLink(project)!
</script>

<template>
  <main class="pt-[calc(var(--header-h)+clamp(1.5rem,4vw,3rem))]">
    <ProjectCaseHero :project="project" />
    <ProjectCaseStage :project="project" />
    <!-- a game is best explained by playing it: the demo comes before the story -->
    <ProjectCaseDemo
      :project="project"
      :src="demo"
    />
    <ProjectCaseStory :project="project" />
    <ProjectCaseNext :project="next" />
  </main>
</template>
