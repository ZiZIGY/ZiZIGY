<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import gsap from 'gsap';

  interface Props {
    duration?: number;
    autoHide?: boolean;
    primaryColor?: string;
    secondaryColor?: string;
    size?: number;
    logoSrc?: string;
    showText?: boolean;
    loadingText?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    duration: 2000,
    autoHide: true,
    primaryColor: 'var(--primary, #42b883)',
    secondaryColor: 'var(--secondary, #8a2be2)',
    size: 80,
    logoSrc: '',
    showText: true,
    loadingText: 'Загрузка...',
  });

  const emit = defineEmits(['complete']);

  const preloaderRef = ref<HTMLElement | null>(null);
  const circleRef = ref<SVGCircleElement | null>(null);
  const visible = ref(true);
  const progress = ref(0);

  // Анимация круговой загрузки
  const animateProgress = () => {
    if (!circleRef.value) return;

    gsap.to(progress, {
      value: 100,
      duration: props.duration / 1000,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (circleRef.value) {
          // Рассчитываем параметры для анимации круга
          const radius = 40;
          const circumference = 2 * Math.PI * radius;
          const dashOffset = circumference * (1 - progress.value / 100);

          circleRef.value.style.strokeDashoffset = dashOffset.toString();
        }
      },
    });
  };

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
    // Запускаем анимацию прогресса
    animateProgress();

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
      <div
        class="preloader-circle"
        :style="{ width: `${size}px`, height: `${size}px` }"
      >
        <!-- Круг загрузки -->
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <!-- Базовый круг (фон) -->
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#333333"
            stroke-width="3"
          />
          <!-- Анимированный круг -->
          <circle
            ref="circleRef"
            cx="50"
            cy="50"
            r="40"
            fill="none"
            :stroke="primaryColor"
            stroke-width="3"
            stroke-linecap="round"
            style="transform: rotate(-90deg); transform-origin: center"
            stroke-dasharray="251.2"
            stroke-dashoffset="251.2"
          />
        </svg>

        <!-- Логотип или значок внутри круга -->
        <div
          v-if="logoSrc"
          class="preloader-logo"
        >
          <img
            :src="logoSrc"
            alt="Loading"
          />
        </div>
        <div
          v-else
          class="preloader-dot"
          :style="{ backgroundColor: secondaryColor }"
        ></div>
      </div>

      <!-- Текст загрузки -->
      <div
        v-if="showText"
        class="preloader-text"
        :style="{ color: primaryColor }"
      >
        {{ loadingText }}
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

  .preloader-circle {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .preloader-logo {
    position: absolute;
    width: 60%;
    height: 60%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .preloader-logo img {
    max-width: 100%;
    max-height: 100%;
  }

  .preloader-dot {
    position: absolute;
    width: 30%;
    height: 30%;
    border-radius: 50%;
    animation: pulse-glow 1.5s infinite ease-in-out;
  }

  .preloader-text {
    margin-top: 20px;
    font-size: 16px;
    letter-spacing: 2px;
    animation: text-fade 1.5s infinite ease-in-out;
  }

  @keyframes pulse-glow {
    0%,
    100% {
      transform: scale(0.85);
      opacity: 0.7;
    }
    50% {
      transform: scale(1);
      opacity: 1;
      box-shadow: 0 0 15px currentColor;
    }
  }

  @keyframes text-fade {
    0%,
    100% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
  }
</style>
