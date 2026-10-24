<script setup lang="ts">
const { t } = useI18n()
const localeHead = useLocaleHead()

useHead({
  htmlAttrs: {
    lang: () => localeHead.value.htmlAttrs.lang,
    dir: () => localeHead.value.htmlAttrs.dir,
  },
  link: () => localeHead.value.link,
  meta: () => [
    ...localeHead.value.meta,
    { name: 'theme-color', content: '#ff4f1a' },
  ],
  titleTemplate: title => (title ? `${title} · ${t('meta.title')}` : t('meta.title')),
})

useSeoMeta({
  description: () => t('meta.description'),
  ogTitle: () => t('meta.title'),
  ogDescription: () => t('meta.description'),
  ogType: 'website',
})
</script>

<template>
  <AppSmoothScroll />
  <FxLiquidGlassFilter />
  <NuxtRouteAnnouncer />
  <AppPreloader />
  <ClientOnly>
    <AppCursor />
  </ClientOnly>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
