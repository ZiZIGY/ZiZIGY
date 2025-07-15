<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { ref, onMounted } from 'vue';
  import gsap from 'gsap';
  import { GlassmorphismCard } from '@/components/UI/GlassmorphismCard';

  // Импорт выделенных компонентов
  import ProfileInfo from './ProfileInfo.vue';
  import StatsGrid from './StatsGrid.vue';
  import TechStack from './TechStack.vue';

  const { t } = useI18n();

  const sectionRef = ref<HTMLElement | null>(null);
  const titleRef = ref<HTMLElement | null>(null);
  const subtitleRef = ref<HTMLElement | null>(null);
  const textRef = ref<HTMLElement | null>(null);
  const cardsRef = ref<HTMLElement | null>(null);
  const stackRef = ref<HTMLElement | null>(null);

  onMounted(() => {
    // Анимация заголовка и подзаголовка
    gsap.from(titleRef.value, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.2,
    });

    gsap.from(subtitleRef.value, {
      opacity: 0,
      y: 15,
      duration: 0.8,
      delay: 0.4,
    });

    // Анимация текстового блока
    gsap.from(textRef.value, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.5,
    });

    if (stackRef.value) {
      const techItems = stackRef.value.querySelectorAll('.tech-category');
      gsap.from(techItems, {
        opacity: 0,
        x: -20,
        stagger: 0.1,
        duration: 0.8,
        delay: 0.8,
      });
    }
  });
</script>

<template>
  <section
    ref="sectionRef"
    class="py-24 relative overflow-hidden"
  >
    <div class="container mx-auto px-4 relative z-10">
      <GlassmorphismCard
        class="p-10"
        gradientStart="rgba(255, 255, 255, 0.12)"
        gradientEnd="rgba(255, 255, 255, 0.03)"
        :blurAmount="25"
        glowPrimary="rgba(66, 184, 131, 0.25)"
        glowSecondary="rgba(138, 43, 226, 0.2)"
      >
        <!-- Заголовок секции -->
        <div class="text-center mb-20">
          <h2
            ref="titleRef"
            class="section-title text-4xl md:text-5xl font-bold mb-3"
          >
            {{ t('about.title') }}
          </h2>
          <p
            ref="subtitleRef"
            class="section-subtitle text-xl text-center max-w-2xl mx-auto"
          >
            {{ t('about.subtitle') }}
          </p>
        </div>

        <!-- Текстовый блок с информацией -->
        <div
          ref="textRef"
          class="mb-16 max-w-4xl mx-auto p-6 rounded-2xl bg-black/10 backdrop-blur-sm border border-white/10"
        >
          <ProfileInfo />
        </div>

        <!-- Статистика -->
        <div
          ref="cardsRef"
          class="mb-20"
        >
          <StatsGrid />
        </div>

        <!-- Технологический стек -->
        <div ref="stackRef">
          <TechStack />
        </div>
      </GlassmorphismCard>
    </div>
  </section>
</template>

<style scoped>
  .from-primary {
    --tw-gradient-from: var(--primary);
  }

  .to-primary\/70 {
    --tw-gradient-to: rgba(66, 184, 131, 0.7);
  }

  .from-secondary {
    --tw-gradient-from: var(--secondary);
  }

  .to-secondary\/70 {
    --tw-gradient-to: rgba(138, 43, 226, 0.7);
  }

  .section-title {
    color: #ffffff;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 0.5rem 0;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5),
      0 0 20px rgba(79, 158, 255, 0.3);
    position: relative;
    display: inline-block;
  }

  .section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background-color: #4f9eff;
    border-radius: 2px;
    box-shadow: 0 0 15px rgba(79, 158, 255, 0.7);
  }

  .section-subtitle {
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 0 10px rgba(79, 158, 255, 0.3);
  }
</style>
