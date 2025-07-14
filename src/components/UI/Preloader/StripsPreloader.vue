<script setup lang="ts">
  import { motion } from 'motion-v';
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useTimeout } from '@vueuse/core';

  const {
    stripeCount = 4,
    duration = 2500,
    stripeDelay = 0.1,
  } = defineProps<{
    stripeCount?: number;
    duration?: number;
    stripeColor?: string;
    stripeDelay?: number;
    stripeClass?: string;
    showText?: boolean;
  }>();

  const emit = defineEmits(['complete']);
  const isVisible = ref(true);
  const { t } = useI18n();

  const sec = 1000;

  const totalDuration =
    duration + (stripeCount - 1) * (stripeDelay * sec) + sec;

  useTimeout(totalDuration, {
    callback: () => {
      isVisible.value = false;
      emit('complete');
    },
  });
</script>

<template>
  <div
    v-if="isVisible"
    class="preloader"
  >
    <motion.div
      v-for="i in stripeCount"
      :key="i"
      :style="{
        top: `${((i - 1) / stripeCount) * 100}%`,
        height: `${100 / stripeCount}%`,
      }"
      :initial="{ scaleX: 1 }"
      :animate="{ scaleX: 0 }"
      :transition="{
        duration: 1,
        ease: 'easeInOut',
        delay: duration / sec + (i - 1) * stripeDelay,
      }"
      class="stripe"
      :class="stripeClass"
    />

    <!-- Текст загрузки -->
    <motion.div
      class="preloader-text"
      :initial="{ opacity: 1, y: 0 }"
      :animate="{ opacity: 0, y: 20 }"
      :transition="{ duration: 0.8, delay: duration / sec }"
    >
      <div class="welcome">{{ t('common.preloader.welcome') }}</div>
      <div class="loading">
        {{ t('common.preloader.loading') }}
        <span class="dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </span>
      </div>
    </motion.div>
  </div>
</template>

<style scoped>
  .preloader {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    pointer-events: none;
  }

  .stripe {
    position: absolute;
    left: 0;
    width: 100%;
    transform-origin: right;
    background-color: #000;
  }

  .preloader-text {
    position: relative;
    z-index: 10;
    color: white;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    letter-spacing: 2px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .welcome {
    font-size: 32px;
    margin-bottom: 10px;
  }

  .loading {
    display: flex;
    align-items: center;
    font-size: 20px;
  }

  .dots {
    display: inline-flex;
    margin-left: 8px;
    align-items: center;
  }

  .dot {
    width: 6px;
    height: 6px;
    background-color: white;
    border-radius: 50%;
    margin: 0 3px;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .dot:nth-child(1) {
    animation-delay: 0s;
  }
  .dot:nth-child(2) {
    animation-delay: 0.3s;
  }
  .dot:nth-child(3) {
    animation-delay: 0.6s;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(0.5);
      opacity: 0.5;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
