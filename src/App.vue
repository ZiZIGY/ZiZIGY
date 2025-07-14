<script setup lang="ts">
  import Header from './components/App/Header/Header.vue';
  import HeroSection from './components/Sections/HeroSection';
  import { AboutSection } from './components/Sections/AboutSection';
  import { LiquidBackground } from './components/UI/LiquidBackground';
  import { StripsPreloader } from './components/UI/Preloader';
</script>

<template>
  <div class="app-container">
    <!-- Основной контент сайта (рендерится всегда) -->
    <div class="min-h-screen relative overflow-hidden">
      <Header />
      <main>
        <LiquidBackground
          class="fixed inset-0 -z-5"
          primaryColor="#8a2be2"
          secondaryColor="#42b883"
          :intensity="1.2"
        />
        <HeroSection />
        <AboutSection />
        <!-- Здесь будут другие секции -->
        <!-- Секция с проектами (Projects) -->
        <!-- Секция с отзывами (Testimonials) -->
        <!-- Секция блога (Blog) -->
        <!-- Секция контактов (Contact) -->
      </main>
      <footer
        class="bg-black/20 backdrop-blur-sm py-6 text-center text-gray-400 text-sm border-t border-gray-800"
      >
        <div class="container mx-auto px-4">
          <p>© 2024 Alexander ZiZIGY. Все права защищены.</p>
        </div>
      </footer>
    </div>

    <StripsPreloader
      :duration="2500"
      class="page-preloader"
    />
  </div>
</template>

<style>
  body:has(.page-preloader) {
    overflow: hidden;
  }

  :root {
    --primary: #42b883;
    --secondary: #8a2be2;
  }

  .app-container {
    position: relative;
    min-height: 100vh;
  }
</style>
