<script setup lang="ts">
  import { GlowBorder } from '@/components/UI/GlowBorder';
  import { defineProps } from 'vue';

  defineProps<{
    title: string;
    items: string[];
    color?: string;
  }>();
</script>

<template>
  <div
    class="tech-category p-6 rounded-lg bg-black/20 backdrop-blur-sm border border-white/5"
  >
    <h4
      class="category-title text-lg font-bold mb-4"
      :style="{ color }"
    >
      {{ title }}
    </h4>

    <div class="flex flex-wrap gap-2">
      <span
        v-for="(tech, i) in items"
        :key="i"
        class="tech-tag px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/25 transition-colors"
      >
        <GlowBorder :color="color" />
        {{ tech }}
      </span>
    </div>
  </div>
</template>

<style scoped>
  .tech-tag {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    letter-spacing: 0.4px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .category-title {
    color: #4f9eff;
    letter-spacing: 0.5px;
    text-shadow: 0 0 8px rgba(79, 158, 255, 0.4);
  }
</style>
