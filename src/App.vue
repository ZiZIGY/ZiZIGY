<script setup lang="ts">
  import { onMounted } from 'vue';
  import Header from './components/App/Header/Header.vue';
  import HeroSection from './components/Sections/HeroSection';

  // Устанавливаем темную тему по умолчанию
  onMounted(() => {
    document.documentElement.classList.add('dark');
  });
</script>

<template>
  <div class="min-h-screen bg-dark">
    <Header />
    <main>
      <HeroSection />
      <!-- Здесь будут другие секции -->
    </main>
  </div>
</template>

<style>
  /* Глобальные стили */
  body {
    min-height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
    background-color: #121212;
    color: white;
  }

  /* Для корректных переходов */
  *,
  *::before,
  *::after {
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }
</style>
