<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { ArrowRightIcon, CodeBracketIcon } from '@heroicons/vue/24/outline';
  import { LiquidBackground } from '../../UI/LiquidBackground';
  import { Button } from '@/components/UI/Button';
  import { RainbowButton } from '@/components/UI/RainbowButton';
  import { FlipWords } from '@/components/UI/FlipWords';
  import { GlowBorder } from '@/components/UI/GlowBorder';
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
          <div class="relative w-72 h-72 md:w-80 md:h-80 rounded-full">
            <!-- Фоновое свечение -->
            <div class="glassmorphism-glow"></div>

            <!-- Компонент GlowBorder для создания светящейся обводки -->
            <GlowBorder
              :borderRadius="9999"
              :borderWidth="4"
              :color="['#ff6b6b', '#feca57', '#48dbfb']"
              :duration="8"
            />

            <div class="avatar">
              <div class="glassmorphism-overlay"></div>
              <img
                src="/images/avatar.png"
                alt="Alexander ZiZIGY"
                class="object-cover w-full h-full rounded-full"
              />
            </div>

            <!-- Декоративные элементы -->
            <div
              class="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl z-0 border border-white/20"
            ></div>
            <div
              class="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl z-0 border border-white/20"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  .glassmorphism-glow {
    position: absolute;
    width: 120%;
    height: 120%;
    left: -10%;
    top: -10%;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 107, 107, 0.4) 0%,
      rgba(254, 202, 87, 0.3) 30%,
      rgba(72, 219, 251, 0.2) 60%,
      transparent 80%
    );
    filter: blur(25px);
    animation: rotate 10s infinite linear;
    z-index: 0;
  }

  .avatar {
    position: absolute;
    inset: 6px;
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

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
