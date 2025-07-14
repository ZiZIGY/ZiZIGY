<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import TechCategory from './TechCategory.vue';
  import { IconCloud } from '@/components/UI/IconCloud';

  const { t } = useI18n();

  // Определяем категории технологий
  const techCategories = [
    {
      title: 'Frontend',
      items: [
        'JavaScript',
        'TypeScript',
        'React',
        'Vue.js',
        'HTML5',
        'CSS3',
        'Sass',
      ],
      color: '#4f9eff',
    },
    {
      title: 'State & Routing',
      items: ['Redux', 'Pinia', 'Zustand', 'React Router'],
      color: '#10b981',
    },
    {
      title: 'Frameworks',
      items: ['Next.js', 'Nuxt.js', 'Remix', 'Bitrix'],
      color: '#f59e0b',
    },
    {
      title: 'Animation & 3D',
      items: ['GSAP', 'AnimeJS', 'D3.js', 'ChartJS', 'ThreeJS', 'PixiJS'],
      color: '#ec4899',
    },
  ];

  // Иконки для облака технологий
  const techIcons = [
    '/images/tech/js.png',
    '/images/tech/ts.png',
    '/images/tech/react.png',
    '/images/tech/vue.png',
    '/images/tech/html.png',
    '/images/tech/css.png',
    '/images/tech/sass.png',
    '/images/tech/redux.png',
    '/images/tech/nextjs.png',
    '/images/tech/nuxtjs.png',
    '/images/tech/gsap.svg',
    '/images/tech/three.png',
    '/images/tech/pinia.png',
    '/images/tech/zustand.png',
    '/images/tech/remixjs.png',
  ];
</script>

<template>
  <div
    class="max-w-5xl mx-auto p-6 rounded-2xl bg-black/10 backdrop-blur-sm border border-white/10"
  >
    <h3 class="tech-title text-3xl font-bold text-center mb-10">
      {{ t('about.techStack.title') }}
    </h3>

    <div class="tech-content grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Облако технологий -->
      <div class="tech-cloud-container lg:col-span-1">
        <div class="tech-cloud-wrapper">
          <IconCloud
            class="aspect-square"
            :images="techIcons"
          />
        </div>
      </div>

      <!-- Категории технологий -->
      <div class="tech-categories lg:col-span-2 grid md:grid-cols-2 gap-6">
        <TechCategory
          v-for="(category, index) in techCategories"
          :key="index"
          :title="category.title"
          :items="category.items"
          :color="category.color"
          class="tech-category"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .tech-title {
    color: #ffffff;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 0.5rem 0;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5),
      0 0 20px rgba(79, 158, 255, 0.3);
    position: relative;
    display: inline-block;
  }

  .tech-title::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background-color: #4f9eff;
    border-radius: 2px;
    box-shadow: 0 0 15px rgba(79, 158, 255, 0.7);
  }

  .tech-icon {
    margin-right: 8px;
  }

  .tech-cloud-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .tech-cloud-wrapper {
    width: 100%;
    height: 100%;
    min-height: 320px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .tech-cloud-wrapper:hover {
    border-color: rgba(79, 158, 255, 0.3);
    box-shadow: 0 8px 32px rgba(79, 158, 255, 0.15);
  }
</style>
