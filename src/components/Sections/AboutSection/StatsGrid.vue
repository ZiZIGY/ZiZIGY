<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import StatCard from './StatCard.vue';
  import { onMounted, ref } from 'vue';

  const { t } = useI18n();
  const statsGridRef = ref<HTMLElement | null>(null);

  onMounted(() => {
    if (!statsGridRef.value) return;

    const cards = statsGridRef.value.querySelectorAll('.stat-card');
    cards.forEach((card, index) => {
      card.classList.add('animate-in');
      (card as HTMLElement).style.animationDelay = `${index * 0.1}s`;
    });
  });
</script>

<template>
  <div
    ref="statsGridRef"
    class="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4"
  >
    <StatCard
      :title="t('about.stats.experience.title')"
      :value="t('about.stats.experience.value')"
      :suffix="t('about.stats.experience.suffix')"
      gradient="from-primary"
    />
    <StatCard
      :title="t('about.stats.articles.title')"
      :value="t('about.stats.articles.value')"
      :suffix="t('about.stats.articles.suffix')"
      gradient="from-secondary"
    />
    <StatCard
      :title="t('about.stats.clients.title')"
      :value="t('about.stats.clients.value')"
      :suffix="t('about.stats.clients.suffix')"
      gradient="from-blue-500"
    />
    <StatCard
      :title="t('about.stats.projects.title')"
      :value="t('about.stats.projects.value')"
      :suffix="t('about.stats.projects.suffix')"
      gradient="from-green-500"
    />
  </div>
</template>

<style scoped>
  .stats-grid {
    padding: 1.5rem 0;
  }

  .stat-card {
    opacity: 0;
    transform: translateY(30px);
  }

  .stat-card.animate-in {
    animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
