<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t, tm } = useI18n();
</script>

<template>
  <div class="space-y-4">
    <p class="text-lg text-gray-200">{{ t('about.description1') }}</p>
    <p class="text-lg text-gray-200">{{ t('about.description2') }}</p>

    <div class="grid md:grid-cols-2 gap-8 mt-8">
      <!-- Опыт -->
      <div>
        <h3 class="info-title text-xl font-semibold mb-4 flex items-center">
          <span class="w-2 h-2 bg-primary rounded-full mr-2"></span>
          {{ t('about.experience.title') }}
        </h3>
        <ul class="space-y-2">
          <li
            v-for="(item, i) in tm('about.experience.items')"
            :key="i"
            class="flex items-center text-gray-300"
          >
            <span class="text-primary mr-2">▸</span>
            {{ item }}
          </li>
        </ul>
      </div>

      <!-- Интересы -->
      <div>
        <h3 class="info-title text-xl font-semibold mb-4 flex items-center">
          <span class="w-2 h-2 bg-secondary rounded-full mr-2"></span>
          {{ t('about.interests.title') }}
        </h3>
        <ul class="space-y-2">
          <li
            v-for="(item, i) in tm('about.interests.items')"
            :key="i"
            class="flex items-center text-gray-300"
          >
            <span class="text-secondary mr-2">▸</span>
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .info-title {
    color: #ffffff;
    letter-spacing: 0.5px;
    text-shadow: 0 0 8px rgba(79, 158, 255, 0.4);
  }
</style>
