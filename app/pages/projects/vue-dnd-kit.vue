<script setup lang="ts">
const { project, next } = useProjectCase('vue-dnd-kit')
</script>

<template>
  <main class="pt-[calc(var(--header-h)+clamp(1.5rem,4vw,3rem))]">
    <ProjectCaseHero :project="project" />
    <ProjectCaseStage :project="project" />
    <ProjectCaseStory :project="project" />
    <ProjectLibraryStats />
    <ProjectCaseNext :project="next" />
  </main>
</template>
