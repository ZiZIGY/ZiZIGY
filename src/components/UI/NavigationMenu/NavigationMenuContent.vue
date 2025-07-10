<script setup lang="ts">
  import type { HTMLAttributes } from 'vue';
  import { reactiveOmit } from '@vueuse/core';
  import {
    NavigationMenuContent,
    type NavigationMenuContentEmits,
    type NavigationMenuContentProps,
    useForwardPropsEmits,
  } from 'reka-ui';
  import { cn } from '@/lib/utils';

  const props = defineProps<
    NavigationMenuContentProps & { class?: HTMLAttributes['class'] }
  >();
  const emits = defineEmits<NavigationMenuContentEmits>();

  const delegatedProps = reactiveOmit(props, 'class');
  const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <NavigationMenuContent
    data-slot="navigation-menu-content"
    v-bind="forwarded"
    :class="
      cn(
        'data-[motion=from-start]:animate-enterFromLeft data-[motion=from-end]:animate-enterFromRight data-[motion=to-start]:animate-exitToLeft data-[motion=to-end]:animate-exitToRight absolute left-0 top-0 w-full sm:w-auto bg-background/80 backdrop-blur-md border border-white/20 shadow-lg rounded-lg',
        props.class
      )
    "
  >
    <slot />
  </NavigationMenuContent>
</template>
