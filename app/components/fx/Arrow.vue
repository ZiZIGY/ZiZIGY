<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
</script>

<template>
  <!-- on hover of the surrounding link/button the arrow flies out top-right and a fresh one slides in -->
  <span
    class="fx-arrow relative inline-flex size-[1em] shrink-0 overflow-hidden"
    aria-hidden="true"
  >
    <ArrowUpRight class="arrow-out absolute inset-0 size-full" />
    <ArrowUpRight class="arrow-in absolute inset-0 size-full" />
  </span>
</template>

<style scoped>
.arrow-out,
.arrow-in {
  stroke-width: 2.25;
  transition: translate 0.55s var(--ease-out-expo);
}

.arrow-in {
  translate: -110% 110%;
}

@media (hover: hover) {
  :where(a, button, .group):hover .arrow-out {
    translate: 110% -110%;
  }

  :where(a, button, .group):hover .arrow-in {
    translate: 0 0;
  }
}
</style>
