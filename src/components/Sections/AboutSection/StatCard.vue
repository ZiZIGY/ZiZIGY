<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    title: string;
    value: string;
    suffix?: string;
    gradient?: string;
  }>();

  const getAccentColor = computed(() => {
    switch (props.gradient) {
      case 'from-primary':
        return '#42b883';
      case 'from-secondary':
        return '#8a2be2';
      case 'from-blue-500':
        return '#3b82f6';
      case 'from-green-500':
        return '#22c55e';
      default:
        return '#64748b';
    }
  });

  import * as Decoration from '@/components/UI/Decoration';
</script>

<template>
  <Decoration.CardWrapper>
    <div class="stat-card">
      <div class="stat-content">
        <div
          class="value-circle relative"
          :style="{ borderColor: getAccentColor }"
        >
          <div
            class="value-text"
            :style="{ color: getAccentColor }"
          >
            {{ value }}
          </div>
        </div>

        <div class="title-container">
          <div class="title-text">{{ title }}</div>
        </div>
      </div>
    </div>
  </Decoration.CardWrapper>
</template>

<style scoped>
  .stat-card {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 16px;
    /* background: rgba(15, 23, 42, 0.5); */
    /* backdrop-filter: blur(10px); */
    /* border: 1px solid rgba(255, 255, 255, 0.1); */
    /* box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); */
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .stat-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding: 1.5rem;
  }

  .value-circle {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 2px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1f2e;
    margin-bottom: 1.5rem;
    z-index: 2;
  }

  /* Пунктирный круг через псевдоэлемент */

  .value-text {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1;
  }

  .title-container {
    text-align: center;
  }

  .title-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  @keyframes rotate {
    from {
      transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) scale(1.2) rotate(360deg);
    }
  }
</style>
