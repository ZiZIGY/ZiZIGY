<script setup lang="ts">
defineProps<{ word: string }>()
</script>

<template>
  <!-- "again and again": the same word keeps rolling in like a slot machine that never stops -->
  <span
    class="rolling"
    aria-hidden="true"
  >
    <span class="rolling-track">
      <span
        v-for="copy in 3"
        :key="copy"
        class="rolling-item"
      >{{ word }}</span>
    </span>
  </span>
</template>

<style scoped lang="scss">
$h: 1.2em;

.rolling {
  display: inline-block;
  height: $h;
  overflow: clip;
  vertical-align: bottom;
  // extra room so the slanted glyphs aren't clipped at the sides
  padding-inline: 0.08em;
  margin-inline: -0.08em;
  margin-bottom: -0.07em;
}

.rolling-track {
  display: flex;
  flex-direction: column;
  animation: roll 4.8s infinite;
  will-change: transform;
}

.rolling-item {
  display: block;
  height: $h;
  line-height: $h;
}

// the 3rd copy looks exactly like the 1st, so the wrap from 100% back to 0% is invisible
@keyframes roll {
  0%,
  34% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.76, 0, 0.24, 1);
  }

  50%,
  84% {
    transform: translateY(-$h);
    animation-timing-function: cubic-bezier(0.76, 0, 0.24, 1);
  }

  100% {
    transform: translateY(-2 * $h);
  }
}

@include reduced-motion {
  .rolling-track {
    animation: none;
  }
}
</style>
