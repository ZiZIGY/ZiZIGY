<script setup lang="ts">
withDefaults(defineProps<{
  name: 'me' | 'me-sketch'
  alt?: string
  sizes?: string
}>(), { alt: '', sizes: '(min-width: 64rem) 40vw, 92vw' })
</script>

<template>
  <picture class="about-picture">
    <source
      type="image/avif"
      :srcset="`${withBase(`/images/${name}-640.avif`)} 640w, ${withBase(`/images/${name}-1024.avif`)} 1024w`"
      :sizes="sizes"
    >
    <source
      type="image/webp"
      :srcset="`${withBase(`/images/${name}-640.webp`)} 640w, ${withBase(`/images/${name}-1024.webp`)} 1024w`"
      :sizes="sizes"
    >
    <img
      :src="withBase(`/images/${name}-1024.webp`)"
      width="1024"
      height="1536"
      :alt="alt"
      loading="lazy"
      decoding="async"
    >
  </picture>
</template>

<style scoped>
.about-picture {
  display: block;
  width: 100%;
  height: 100%;
}

.about-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 0%;
}
</style>
