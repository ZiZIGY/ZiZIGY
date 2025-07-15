<script setup lang="ts"></script>

<template>
  <div class="relative">
    <slot />
    <div class="absolute inset-0 border aspect-square rotate-45 border-white" />

    <div
      class="absolute border h-[250%] w-px inset-0 m-auto flex flex-col gap-2 border-white"
    >
      <div
        class="absolute w-6 h-6 bg-white top-0 -translate-x-1/2 -translate-y-1/2 rounded-full orbit"
      />
      <div
        class="absolute w-6 h-6 bg-white bottom-0 -translate-x-1/2 translate-y-1/2 rounded-full orbit"
      />
    </div>

    <div
      class="absolute inset-0 border aspect-square rotate-45 border-white top-full h-1/2 m-auto"
    />
  </div>
</template>

<style scoped>
  .orbit::before {
    content: '';
    position: absolute;
    inset: 0;
    margin: auto;
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    border: 1px white dashed;
    padding: 3px;
    box-sizing: content-box;

    transform: translateX(-4px);
  }
</style>
