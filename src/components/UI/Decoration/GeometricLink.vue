<script setup lang="ts">
  defineProps({
    borderColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.2)',
    },
    dotColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.8)',
    },
    hoverColor: {
      type: String,
      default: 'rgba(66, 184, 131, 0.5)',
    },
    size: {
      type: String,
      default: 'auto',
    },
    external: {
      type: Boolean,
      default: false,
    },
  });
</script>

<template>
  <div
    class="relative"
    :style="{ width: size, height: size }"
  >
    <!-- Основной ромб -->
    <div
      class="pointer-events-none border aspect-square h-full m-auto rotate-45 absolute inset-0"
      :style="{ borderColor }"
    />

    <!-- Горизонтальная линия с точками -->
    <div
      class="pointer-events-none border-b absolute h-px w-full inset-0 m-auto"
      :style="{ borderColor }"
    >
      <div
        class="pointer-events-none rounded-full absolute w-1.5 h-1.5 left-0 m-auto -translate-x-1/2 -translate-y-1/2"
        :style="{
          backgroundColor: dotColor,
          boxShadow: `0 0 8px 1px ${dotColor}`,
        }"
      />
      <div
        class="pointer-events-none rounded-full absolute w-1.5 h-1.5 right-0 m-auto translate-x-1/2 -translate-y-1/2"
        :style="{
          backgroundColor: dotColor,
          boxShadow: `0 0 8px 1px ${dotColor}`,
        }"
      />
    </div>

    <slot />
  </div>
</template>
