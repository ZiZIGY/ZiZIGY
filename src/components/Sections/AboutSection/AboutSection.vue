<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { Profile } from '@/components/Widget/Profile';
  import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
  import { ParticlesBg } from '@/components/UI/ParticlesBg';
  import { CardSpotlight } from '@/components/UI/СardSpotlight';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import {
    CodeBracketIcon,
    PuzzlePieceIcon,
    CubeIcon,
    PencilIcon,
    CommandLineIcon,
    SparklesIcon,
    RocketLaunchIcon,
    DocumentTextIcon,
  } from '@heroicons/vue/24/outline';

  // Регистрируем плагин ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  const { t, tm } = useI18n();

  // Получаем массивы с данными для опыта и интересов из локализации
  const experienceItems = computed(
    () => tm('about.experience.items') as string[]
  );
  const interestsItems = computed(
    () => tm('about.interests.items') as string[]
  );

  // Иконки для элементов опыта
  const experienceIcons = [
    CodeBracketIcon,
    CommandLineIcon,
    CubeIcon,
    PencilIcon,
  ];

  // Иконки для элементов увлечений
  const interestIcons = [
    PuzzlePieceIcon,
    SparklesIcon,
    RocketLaunchIcon,
    DocumentTextIcon,
  ];

  // Рефы для анимации
  const sectionRef = ref<HTMLElement | null>(null);
  const titleRef = ref<HTMLElement | null>(null);
  const profileRef = ref<HTMLElement | null>(null);
  const contentRef = ref<HTMLElement | null>(null);
  const cardsRef = ref<HTMLElement | null>(null);

  // Массив для хранения экземпляров ScrollTrigger
  const scrollTriggers: gsap.core.Tween[] = [];

  onMounted(() => {
    // Анимация заголовка
    const titleTween = gsap.from(titleRef.value, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: titleRef.value,
        start: 'top bottom-=100',
        end: 'bottom center',
        toggleActions: 'play none none reverse',
      },
    });
    scrollTriggers.push(titleTween);

    // Анимация профиля
    const profileTween = gsap.from(profileRef.value, {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: profileRef.value,
        start: 'top bottom-=50',
        end: 'bottom center',
        toggleActions: 'play none none reverse',
      },
    });
    scrollTriggers.push(profileTween);

    // Анимация контента
    const contentTween = gsap.from(contentRef.value, {
      x: 50,
      opacity: 0,
      duration: 1,
      delay: 0.3,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: contentRef.value,
        start: 'top bottom-=100',
        end: 'bottom center',
        toggleActions: 'play none none reverse',
      },
    });
    scrollTriggers.push(contentTween);

    // Анимация карточек
    const cards = cardsRef.value?.querySelectorAll('.card-item');
    if (cards) {
      gsap.from(cards, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cardsRef.value,
          start: 'top bottom-=50',
          end: 'bottom center',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // Параллакс эффект для фона
    gsap.to(sectionRef.value, {
      backgroundPosition: '50% 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Очистка ScrollTrigger при размонтировании компонента
  onBeforeUnmount(() => {
    scrollTriggers.forEach((trigger) => {
      if (trigger.scrollTrigger) {
        trigger.scrollTrigger.kill();
      }
    });
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  });
</script>

<template>
  <section
    id="about"
    ref="sectionRef"
    class="py-20 relative overflow-hidden"
  >
    <!-- Фоновые частицы -->
    <ParticlesBg
      class="absolute inset-0 opacity-30"
      color="#42b883"
      :quantity="60"
      :staticity="80"
      :ease="40"
    />

    <div class="container mx-auto px-4 relative z-10">
      <div
        ref="titleRef"
        class="text-center mb-12"
      >
        <h2 class="text-3xl md:text-4xl font-bold mb-4">{{
          t('about.title')
        }}</h2>
        <div class="w-20 h-1 bg-primary mx-auto"></div>
      </div>

      <div class="grid md:grid-cols-2 gap-10 items-center">
        <!-- Левая колонка с фото -->
        <div
          ref="profileRef"
          class="relative flex justify-center md:order-1 lg:order-none"
        >
          <div class="about-image-wrapper">
            <Profile
              class="max-w-80"
              imageUrl="/images/avatar-2.png"
              imageAlt="Alexander ZiZIGY"
              :borderWidth="3"
              :glowColors="['#42b883', '#8a2be2', '#3498db']"
              :glowDuration="10"
            />
          </div>
        </div>

        <!-- Правая колонка с информацией -->
        <div
          ref="contentRef"
          class="space-y-6 about-content"
        >
          <h3 class="text-2xl font-semibold text-white">{{
            t('about.subtitle')
          }}</h3>

          <p class="text-gray-300">
            {{ t('about.description1') }}
          </p>

          <p class="text-gray-300">
            {{ t('about.description2') }}
          </p>

          <div
            ref="cardsRef"
            class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
          >
            <CardSpotlight
              class="p-6 border-neutral-800 min-h-[220px] card-item"
              gradientColor="#42b883"
              :gradientOpacity="0.5"
            >
              <h4 class="font-medium text-white mb-4 flex items-center">
                <span
                  class="inline-block w-3 h-3 bg-primary rounded-full mr-2"
                ></span>
                {{ t('about.experience.title') }}
              </h4>
              <ul class="space-y-4">
                <li
                  v-for="(item, index) in experienceItems"
                  :key="index"
                  class="flex items-start experience-item"
                >
                  <component
                    :is="experienceIcons[index]"
                    class="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0"
                  />
                  <span class="text-gray-300">{{ item }}</span>
                </li>
              </ul>
            </CardSpotlight>

            <CardSpotlight
              class="p-6 border-neutral-800 min-h-[220px] card-item"
              gradientColor="#8a2be2"
              :gradientOpacity="0.5"
            >
              <h4 class="font-medium text-white mb-4 flex items-center">
                <span
                  class="inline-block w-3 h-3 bg-primary rounded-full mr-2"
                ></span>
                {{ t('about.interests.title') }}
              </h4>
              <ul class="space-y-4">
                <li
                  v-for="(item, index) in interestsItems"
                  :key="index"
                  class="flex items-start interests-item"
                >
                  <component
                    :is="interestIcons[index]"
                    class="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0"
                  />
                  <span class="text-gray-300">{{ item }}</span>
                </li>
              </ul>
            </CardSpotlight>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  .bg-primary {
    background: linear-gradient(90deg, #42b883, #8a2be2);
  }

  .text-primary {
    color: #42b883;
  }

  .about-image-wrapper {
    position: relative;
  }

  /* Отключаем CSS анимации, так как теперь используем GSAP */
  .experience-item,
  .interests-item {
    opacity: 1;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
</style>
