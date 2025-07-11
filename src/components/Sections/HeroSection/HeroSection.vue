<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { ArrowRightIcon, CodeBracketIcon } from '@heroicons/vue/24/outline';
  import { LiquidBackground } from '../../UI/LiquidBackground';
  import { Button } from '@/components/UI/Button';
  import { RainbowButton } from '@/components/UI/RainbowButton';
  import { FlipWords } from '@/components/UI/FlipWords';
  import { Profile } from '@/components/Widget/Profile';
  import { computed } from 'vue';

  const { tm, t } = useI18n();

  const highlightWords = computed(() => tm('hero.highlightWords') as string[]);
</script>

<template>
  <section
    class="min-h-screen flex items-center py-20 relative overflow-hidden"
  >
    <!-- Жидкий фон -->
    <LiquidBackground
      class="absolute inset-0 -z-5"
      primaryColor="#8a2be2"
      secondaryColor="#42b883"
      :intensity="1.2"
    />

    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-2 gap-10 items-center">
        <!-- Левая колонка с текстом -->
        <div class="space-y-6">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            {{ t('hero.title') }}
            <div class="min-h-9">
              <FlipWords
                :words="highlightWords"
                class="text-primary font-bold"
                :duration="2000"
              />
            </div>
          </h1>

          <p class="text-lg text-gray-300 max-w-lg">
            {{ t('hero.description') }}
          </p>

          <div class="flex flex-wrap gap-4 pt-4">
            <a href="#projects">
              <RainbowButton>
                <div class="flex items-center gap-2">
                  <span>{{ t('hero.cta.projects') }}</span>
                  <ArrowRightIcon class="w-5 h-5" />
                </div>
              </RainbowButton>
            </a>

            <a href="#tech-stack">
              <Button>
                <div class="flex items-center gap-2">
                  <CodeBracketIcon class="w-5 h-5" />
                  <span>{{ t('hero.cta.techStack') }}</span>
                </div>
              </Button>
            </a>
          </div>
        </div>

        <!-- Правая колонка с фотографией -->
        <div class="relative flex justify-center">
          <Profile
            class="max-w-96"
            imageUrl="/images/avatar.png"
            imageAlt="Alexander ZiZIGY"
            :borderWidth="4"
            :glowColors="['#ff6b6b', '#feca57', '#48dbfb']"
            :glowDuration="8"
          />
        </div>
      </div>
    </div>
  </section>
</template>
