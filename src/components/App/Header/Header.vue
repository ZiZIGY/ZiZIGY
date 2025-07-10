<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useLocalStorage } from '@vueuse/core';
  import Link from '../../UI/Link';

  import {
    HomeIcon,
    UserIcon,
    CodeBracketIcon,
    RectangleStackIcon,
    EnvelopeIcon,
    LanguageIcon,
  } from '@heroicons/vue/24/outline';
  import { Button } from '@/components/UI/Button';

  const { t, locale } = useI18n();
  const savedLocale = useLocalStorage('locale', 'ru');

  const toggleLocale = () => {
    locale.value = locale.value === 'ru' ? 'en' : 'ru';
    savedLocale.value = locale.value;
  };

  const navLinks = [
    { name: 'header.home', href: '#', icon: HomeIcon },
    { name: 'header.about', href: '#about', icon: UserIcon },
    { name: 'header.techStack', href: '#tech-stack', icon: CodeBracketIcon },
    { name: 'header.projects', href: '#projects', icon: RectangleStackIcon },
    { name: 'header.contact', href: '#contact', icon: EnvelopeIcon },
  ];
</script>

<template>
  <header class="fixed top-0 left-0 w-full z-50 py-4">
    <!-- Гласморфизм фон -->
    <div
      class="absolute inset-0 backdrop-blur-md bg-dark/40 shadow-lg border-b border-white/10"
    ></div>

    <div class="container mx-auto px-4 relative z-10">
      <nav class="flex justify-between items-center">
        <!-- Логотип -->
        <a
          href="#"
          class="text-2xl font-bold text-white group"
        >
          {{ t('common.name') }}
          <span
            class="text-primary group-hover:text-primary-light transition-colors duration-300"
            >{{ t('common.nickname') }}</span
          >
        </a>

        <!-- Навигация -->
        <ul class="flex space-x-6">
          <li
            v-for="(link, index) in navLinks"
            :key="index"
          >
            <Link
              :href="link.href"
              variant="nav"
              :icon="link.icon"
            >
              {{ t(link.name) }}
            </Link>
          </li>
        </ul>

        <!-- Переключатель языка -->
        <Button @click="toggleLocale">
          <LanguageIcon class="w-4 h-4" />
          <span>{{ locale.toUpperCase() }}</span>
        </Button>
      </nav>
    </div>
  </header>
</template>
