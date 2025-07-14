<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    gradientStart?: string;
    gradientEnd?: string;
    blurAmount?: number;
    borderOpacity?: number;
    glowPrimary?: string;
    glowSecondary?: string;
    class?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    gradientStart: 'rgba(255, 255, 255, 0.25)',
    gradientEnd: 'rgba(255, 255, 255, 0.1)',
    blurAmount: 20,
    borderOpacity: 0.25,
    glowPrimary: 'rgba(66, 184, 131, 0.25)',
    glowSecondary: 'rgba(138, 43, 226, 0.2)',
    class: '',
  });

  const cardStyle = computed(() => {
    return {
      background: `linear-gradient(135deg, ${props.gradientStart} 0%, ${props.gradientEnd} 100%)`,
      backdropFilter: `blur(${props.blurAmount}px)`,
      WebkitBackdropFilter: `blur(${props.blurAmount}px)`,
      borderColor: `rgba(255, 255, 255, ${props.borderOpacity})`,
    };
  });

  const beforeStyle = computed(() => {
    return {
      background: `linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0) 100%)`,
    };
  });

  const afterStyle = computed(() => {
    return {
      background: `
      radial-gradient(circle at top right, ${props.glowPrimary}, transparent 40%),
      radial-gradient(circle at bottom left, ${props.glowSecondary}, transparent 30%)
    `,
    };
  });
</script>

<template>
  <div
    class="glassmorphism-card relative p-8 rounded-2xl border"
    :class="props.class"
    :style="cardStyle"
  >
    <div
      class="glassmorphism-card-before"
      :style="beforeStyle"
    ></div>
    <div
      class="glassmorphism-card-after"
      :style="afterStyle"
    ></div>
    <div class="relative z-10">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
  .glassmorphism-card {
    position: relative;
    overflow: hidden;
    color: white;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }

  .glassmorphism-card-before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    z-index: 1;
  }

  .glassmorphism-card-after {
    content: '';
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
