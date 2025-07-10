<script setup lang="ts">
  import type { HTMLAttributes } from 'vue';
  import { reactiveOmit } from '@vueuse/core';
  import {
    NavigationMenuLink,
    type NavigationMenuLinkEmits,
    type NavigationMenuLinkProps,
    useForwardPropsEmits,
  } from 'reka-ui';
  import { cn } from '@/lib/utils';

  const props = defineProps<
    NavigationMenuLinkProps & { class?: HTMLAttributes['class'] }
  >();
  const emits = defineEmits<NavigationMenuLinkEmits>();

  const delegatedProps = reactiveOmit(props, 'class');
  const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <NavigationMenuLink
    data-slot="navigation-menu-link"
    v-bind="forwarded"
    :class="
      cn(
        `data-[active=true]:focus:bg-white/10 data-[active=true]:hover:bg-white/10 data-[active=true]:bg-white/5 data-[active=true]:text-primary hover:bg-white/10 hover:text-primary focus:bg-white/10 focus:text-primary ring-primary/30 outline-primary/50 [&_svg:not([class*='text-'])]:text-white flex flex-col gap-1 rounded-sm p-2 text-sm transition-all duration-200 focus-visible:ring-4 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4`,
        props.class
      )
    "
  >
    <slot />
  </NavigationMenuLink>
</template>
