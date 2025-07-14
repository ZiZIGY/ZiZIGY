<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import gsap from 'gsap';

  interface Props {
    duration?: number;
    autoHide?: boolean;
    color?: string;
    size?: number;
    logoSrc?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    duration: 2000,
    autoHide: true,
    color: 'var(--primary, #42b883)',
    size: 12,
    logoSrc: '',
  });

  const emit = defineEmits(['complete']);

  const preloaderRef = ref<HTMLElement | null>(null);
  const visible = ref(true);

  // Анимация исчезновения прелоадера
  const hidePreloader = () => {
    if (!preloaderRef.value) return;

    gsap.to(preloaderRef.value, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        visible.value = false;
        emit('complete');
      },
    });
  };

  onMounted(() => {
    if (props.autoHide) {
      setTimeout(hidePreloader, props.duration);
    }
  });

  // Метод для ручного скрытия прелоадера
  defineExpose({
    hide: hidePreloader,
  });
</script>

<template>
  <div
    v-if="visible"
    ref="preloaderRef"
    class="preloader-container"
  >
    <div class="preloader-content">
      <!-- Логотип (если передан) -->
      <img
        v-if="logoSrc"
        :src="logoSrc"
        alt="Loading"
        class="preloader-logo mb-6"
      />

      <!-- Анимированные точки -->
      <div class="preloader">
        <div
          class="dot"
          :style="{
            width: `${size}px`,
            height: `${size}px`,
            background: color,
          }"
        ></div>
        <div
          class="dot"
          :style="{
            width: `${size}px`,
            height: `${size}px`,
            background: color,
          }"
        ></div>
        <div
          class="dot"
          :style="{
            width: `${size}px`,
            height: `${size}px`,
            background: color,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .preloader-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000;
    z-index: 9999;
  }

  .preloader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .preloader-logo {
    max-width: 120px;
    max-height: 120px;
    animation: pulse-fade 2s infinite ease-in-out;
  }

  .preloader {
    display: flex;
    align-items: center;
  }

  .dot {
    border-radius: 50%;
    margin: 0 6px;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .dot:nth-child(1) {
    animation-delay: -0.3s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.15s;
  }

  .dot:nth-child(3) {
    animation-delay: 0s;
  }

  @keyframes pulse {
    0%,
    80%,
    100% {
      transform: scale(0.6);
      opacity: 0.6;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pulse-fade {
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }
</style>
