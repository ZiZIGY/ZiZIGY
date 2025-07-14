<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  import { FlipWords } from '@/components/UI/FlipWords';
  import { Profile } from '@/components/Widget/Profile';
  import { GlassmorphismCard } from '@/components/UI/GlassmorphismCard';
  import { computed } from 'vue';

  const { tm, t } = useI18n();

  const highlightWords = computed(() => tm('hero.highlightWords') as string[]);
</script>

<template>
  <section
    class="min-h-screen flex items-center py-20 relative overflow-hidden"
  >
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-2 gap-10 items-center">
        <!-- Левая колонка с текстом в стеклянной карточке -->

        <GlassmorphismCard class="space-y-6 z-10">
          <h1
            class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            {{ t('hero.title') }}
            <div class="min-h-9">
              <FlipWords
                :words="highlightWords"
                class="text-primary font-bold absolute"
                :duration="2000"
              />
            </div>
          </h1>

          <p class="text-lg max-w-lg"> {{ t('hero.description') }} </p>
        </GlassmorphismCard>

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
