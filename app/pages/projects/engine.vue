<script setup lang="ts">
// a closed project: nothing to embed or link to yet
const { project, next } = useProjectCase('engine')
</script>

<template>
  <main class="pt-[calc(var(--header-h)+clamp(1.5rem,4vw,3rem))]">
    <ProjectCaseHero :project="project" />
    <ProjectCaseStage :project="project" />
    <ProjectCaseStory :project="project" />
    <ProjectCaseNext :project="next" />
  </main>
</template>
