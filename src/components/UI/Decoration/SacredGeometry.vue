<script setup lang="ts">
  // Простые пропсы для настройки компонента
  defineProps({
    borderColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.2)',
    },
    dotColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.8)',
    },
    size: {
      type: String,
      default: 'auto',
    },
  });
</script>

<template>
  <div
    class="relative"
    :style="{ width: size, height: size }"
  >
    <div
      class="pointer-events-none border aspect-square h-full m-auto rotate-45 absolute inset-0"
      :style="{ borderColor }"
    />

    <div
      class="pointer-events-none border aspect-square h-full m-auto rotate-45 absolute inset-0 scale-110 border-dashed"
      :style="{ borderColor }"
    />

    <div
      class="pointer-events-none border-l absolute h-[200%] w-px m-auto inset-0"
      :style="{ borderColor }"
    >
      <div
        class="pointer-events-none rounded-full absolute w-2 h-2 top-0 m-auto -translate-x-1/2 -translate-y-1/2"
        :style="{
          backgroundColor: dotColor,
          boxShadow: `0 0 8px 1px ${dotColor}`,
        }"
      />
      <div
        class="pointer-events-none rounded-full absolute w-2 h-2 bottom-0 m-auto -translate-x-1/2 translate-y-1/2"
        :style="{
          backgroundColor: dotColor,
          boxShadow: `0 0 8px 1px ${dotColor}`,
        }"
      />
    </div>

    <div
      class="pointer-events-none border-b absolute h-px w-full inset-0 m-auto"
      :style="{ borderColor }"
    >
      <div
        class="pointer-events-none rounded-full absolute w-2 h-2 left-0 m-auto -translate-x-1/2 -translate-y-1/2"
        :style="{
          backgroundColor: dotColor,
          boxShadow: `0 0 8px 1px ${dotColor}`,
        }"
      />
      <div
        class="pointer-events-none rounded-full absolute w-2 h-2 right-0 m-auto translate-x-1/2 -translate-y-1/2"
        :style="{
          backgroundColor: dotColor,
          boxShadow: `0 0 8px 1px ${dotColor}`,
        }"
      />
    </div>

    <div
      class="pointer-events-none border rounded-full absolute inset-0 aspect-square h-[200%] m-auto"
      :style="{ borderColor }"
    />

    <div
      class="pointer-events-none border rounded-full absolute inset-0 aspect-square m-auto scale-90"
      :style="{ borderColor }"
    />
    <div
      class="pointer-events-none border rounded-full absolute inset-0 aspect-square m-auto scale-95 border-dashed"
      :style="{ borderColor }"
    />

    <div
      class="pointer-events-none border absolute inset-0 aspect-square m-auto rotate-45"
      :style="{ borderColor }"
    />

    <div
      class="pointer-events-none border rounded-full absolute aspect-square h-full translate-x-1/2 translate-y-1/2 left-0"
      :style="{ borderColor }"
    />

    <div
      class="pointer-events-none border rounded-full absolute aspect-square h-full -translate-x-1/2 translate-y-1/2 right-0"
      :style="{ borderColor }"
    />

    <div
      class="pointer-events-none border rounded-full absolute aspect-square h-full translate-x-1/2 -translate-y-1/2 left-0"
      :style="{ borderColor }"
    />

    <div
      class="pointer-events-none border rounded-full absolute aspect-square h-full -translate-x-1/2 -translate-y-1/2 right-0"
      :style="{ borderColor }"
    />

    <slot />
  </div>
</template>
