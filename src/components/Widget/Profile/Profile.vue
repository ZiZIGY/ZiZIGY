<script setup lang="ts">
  import { ref } from 'vue';
  import { GlowBorder } from '@/components/UI/GlowBorder';

  interface Props {
    size?: number;
    imageUrl?: string;
    imageAlt?: string;
    borderWidth?: number;
    glowColors?: string[];
    glowDuration?: number;
    showParticles?: boolean;
    showOrbits?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 320,
    imageUrl: '',
    imageAlt: 'Profile Avatar',
    borderWidth: 4,
    glowColors: () => ['#ff6b6b', '#feca57', '#48dbfb'],
    glowDuration: 8,
    showParticles: true,
    showOrbits: true,
  });

  // Создаем массив декоративных элементов с разными параметрами
  const decorElements = ref([
    {
      size: 16,
      bottom: -6,
      right: -6,
      delay: 0,
      duration: 8,
      color: 'rgba(255, 107, 107, 0.15)',
    },
    {
      size: 12,
      top: -4,
      left: -4,
      delay: 2,
      duration: 10,
      color: 'rgba(72, 219, 251, 0.15)',
    },
    {
      size: 10,
      top: '30%',
      right: -8,
      delay: 4,
      duration: 12,
      color: 'rgba(254, 202, 87, 0.15)',
    },
    {
      size: 8,
      bottom: '20%',
      left: -5,
      delay: 1,
      duration: 9,
      color: 'rgba(255, 255, 255, 0.1)',
    },
    {
      size: 6,
      bottom: -3,
      left: '30%',
      delay: 3,
      duration: 7,
      color: 'rgba(255, 107, 107, 0.1)',
    },
  ]);
</script>

<template>
  <div class="relative backdrop-blur-md rounded-full shadow-2xl">
    <!-- Фоновое свечение -->
    <div class="glassmorphism-glow"></div>

    <GlowBorder
      :borderRadius="9999"
      :borderWidth="borderWidth"
      :color="glowColors"
      :duration="glowDuration"
    />

    <div class="avatar">
      <slot>
        <img
          :src="imageUrl"
          :alt="imageAlt"
          class="object-cover w-full h-full rounded-full"
        />
      </slot>
    </div>

    <!-- Декоративные элементы -->
    <div
      v-for="(elem, index) in decorElements"
      :key="index"
      class="decor-element"
      :style="{
        width: `${elem.size}px`,
        height: `${elem.size}px`,
        bottom: elem.bottom !== undefined ? `${elem.bottom}px` : 'auto',
        top: elem.top !== undefined ? `${elem.top}` : 'auto',
        left: elem.left !== undefined ? `${elem.left}` : 'auto',
        right: elem.right !== undefined ? `${elem.right}px` : 'auto',
        backgroundColor: elem.color,
        animationDelay: `${elem.delay}s`,
        animationDuration: `${elem.duration}s`,
      }"
    ></div>

    <!-- Кольца с точками -->
    <div class="orbit-ring" />

    <div class="orbit-ring orbit-ring-2" />
  </div>
</template>

<style scoped>
  .glassmorphism-glow {
    position: absolute;
    width: 120%;
    height: 120%;
    left: -10%;
    top: -10%;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(
      circle,
      rgba(255, 107, 107, 0.4) 0%,
      rgba(254, 202, 87, 0.3) 30%,
      rgba(72, 219, 251, 0.2) 60%,
      transparent 80%
    );
    filter: blur(25px);
    animation: rotate 10s infinite linear;
    z-index: 10;
  }

  .avatar {
    position: relative;
    aspect-ratio: 1/1;
    border-radius: 50%;
    overflow: hidden;
    z-index: 2;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .avatar:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  .glassmorphism-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(4px);
    z-index: 2;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .avatar:hover .glassmorphism-overlay {
    opacity: 0.3;
  }

  .avatar img {
    transition: transform 0.5s ease;
  }

  .avatar:hover img {
    transform: scale(1.05);
  }

  /* Стили для декоративных элементов */
  .decor-element {
    position: absolute;
    border-radius: 50%;
    backdrop-filter: blur(8px);
    z-index: 1;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    animation: float-around 10s infinite ease-in-out;
  }

  /* Плавающие частицы */
  .particles-container {
    z-index: 0;
    pointer-events: none;
  }

  /* Кольца - улучшаем видимость */
  .orbit-ring {
    position: absolute;
    width: 110%;
    height: 110%;
    border-radius: 50%;
    border: 1.5px dashed rgba(255, 255, 255, 0.4);
    top: -5%;
    left: -5%;
    animation: rotate-slow 30s infinite linear;
    z-index: 0;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
    background: radial-gradient(
      ellipse at center,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 70%
    );
  }

  .orbit-ring-2 {
    width: 120%;
    height: 120%;
    top: -10%;
    left: -10%;
    border: 1px dashed rgba(255, 255, 255, 0.3);
    animation-duration: 40s;
    animation-direction: reverse;
  }

  /* Добавляем точки на орбитах */
  .orbit-dot {
    position: absolute;
    width: 6px;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    margin-top: -3px;
    margin-left: -3px;
    transform: rotate(var(--dot-pos)) translateX(calc(55% - 3px));
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  }

  .orbit-dot-large-2 {
    width: 12px;
    height: 12px;
    margin-top: -6px;
    margin-left: -6px;
    transform: rotate(var(--dot-pos)) translateX(calc(60% - 6px));
    background-color: rgba(72, 219, 251, 1);
    box-shadow: 0 0 20px 5px rgba(72, 219, 251, 1);
    z-index: 3;
  }

  /* Анимации */
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes rotate-slow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes float-around {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    25% {
      transform: translate(5px, -5px) scale(1.1);
    }
    50% {
      transform: translate(0, 8px) scale(0.95);
    }
    75% {
      transform: translate(-5px, 3px) scale(1.05);
    }
  }

  @keyframes particle-float {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
      opacity: 0.6;
    }
    25% {
      transform: translate(15px, -10px) scale(1.2);
      opacity: 1;
    }
    50% {
      transform: translate(30px, 10px) scale(0.8);
      opacity: 0.4;
    }
    75% {
      transform: translate(5px, 20px) scale(1.1);
      opacity: 0.8;
    }
  }

  /* Стили для компонента ParticlesBg */
  .particles-bg {
    position: absolute;
    inset: -20px;
    width: calc(100% + 40px);
    height: calc(100% + 40px);
    z-index: 1;
    pointer-events: none;
    border-radius: 50%;
    overflow: hidden;
  }
</style>
