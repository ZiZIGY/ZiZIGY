<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import Link from '../../UI/Link';
  import { ArrowRightIcon, CodeBracketIcon } from '@heroicons/vue/24/outline';
  import { LiquidBackground } from '../../UI/LiquidBackground';

  const { t } = useI18n();
</script>

<template>
  <section
    class="min-h-screen flex items-center py-20 relative overflow-hidden"
  >
    <!-- Фоновый градиент -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-dark via-dark-surface to-dark-lighter -z-10"
    ></div>

    <!-- Жидкий фон -->
    <LiquidBackground
      class="absolute inset-0 -z-5"
      primaryColor="#8a2be2"
      secondaryColor="#42b883"
      :intensity="1.2"
    />

    <!-- Светящиеся линии -->
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <div
        class="absolute top-1/3 right-0 w-full h-px bg-gradient-to-r from-transparent via-primary-light/30 to-transparent animate-pulse"
      ></div>
      <div
        class="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary-light/30 to-transparent animate-pulse animation-delay-1000"
      ></div>
    </div>

    <!-- Светящиеся шары -->
    <div
      class="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-gradient-to-r from-primary/20 to-primary-light/20 blur-3xl animate-float"
    ></div>
    <div
      class="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full bg-gradient-to-r from-secondary/20 to-secondary-light/20 blur-3xl animate-float animation-delay-2000"
    ></div>

    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-2 gap-10 items-center">
        <!-- Левая колонка с текстом -->
        <div class="space-y-6">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            {{ t('hero.title') }}
            <span class="text-primary">{{ t('hero.highlight') }}</span>
          </h1>

          <p class="text-lg text-gray-300 max-w-lg">
            {{ t('hero.description') }}
          </p>

          <div class="flex flex-wrap gap-4 pt-4">
            <Link
              href="#projects"
              variant="primary"
              :icon="ArrowRightIcon"
              iconPosition="right"
              class="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-primary/30 transition-all"
            >
              {{ t('hero.cta.projects') }}
            </Link>

            <Link
              href="#tech-stack"
              variant="secondary"
              :icon="CodeBracketIcon"
              class="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
            >
              {{ t('hero.cta.techStack') }}
            </Link>
          </div>
        </div>

        <!-- Правая колонка с фотографией -->
        <div class="relative flex justify-center">
          <div class="relative w-80 h-80">
            <!-- Аватар с эффектом свечения -->
            <div class="avatar-container">
              <div class="avatar-glow"></div>
              <div class="avatar">
                <div class="w-full h-full flex items-center justify-center">
                  <div class="text-8xl">👨‍💻</div>
                  <!-- Заменить на <img src="/path/to/photo.jpg" alt="Alexander ZiZIGY" class="w-full h-full object-cover rounded-full"> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  /* Анимации задержек */
  .animation-delay-500 {
    animation-delay: 0.5s;
  }
  .animation-delay-1000 {
    animation-delay: 1s;
  }
  .animation-delay-1500 {
    animation-delay: 1.5s;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-2500 {
    animation-delay: 2.5s;
  }
  .animation-delay-3000 {
    animation-delay: 3s;
  }

  /* Аватар */
  .avatar-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at center,
      rgba(138, 43, 226, 0.4) 0%,
      rgba(138, 43, 226, 0.2) 30%,
      rgba(66, 184, 131, 0.15) 60%,
      transparent 70%
    );
    filter: blur(20px);
    border-radius: 50%;
    opacity: 0.8;
    animation: pulse-glow 6s ease-in-out infinite alternate;
  }

  .avatar {
    position: relative;
    width: 70%;
    height: 70%;
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(30, 30, 40, 0.9),
      rgba(20, 20, 30, 0.9)
    );
    box-shadow: 0 0 30px rgba(138, 43, 226, 0.3),
      0 0 80px rgba(138, 43, 226, 0.1);
    z-index: 10;
    border: 2px solid rgba(138, 43, 226, 0.3);
  }

  @keyframes pulse-glow {
    0% {
      opacity: 0.6;
      transform: scale(0.9);
    }
    100% {
      opacity: 0.9;
      transform: scale(1.1);
    }
  }

  @keyframes animate-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
</style>
