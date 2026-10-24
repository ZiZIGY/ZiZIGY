<script setup lang="ts">
import type { ProjectVisual } from '~/data/projects'

defineProps<{ visual: ProjectVisual }>()
</script>

<template>
  <ProjectVisualDnd v-if="visual === 'dnd'" />
  <ProjectVisualOrb v-else-if="visual === 'orb'" />
  <ProjectVisualSprites v-else-if="visual === 'sprites'" />
  <ProjectVisualEditor v-else />
</template>
