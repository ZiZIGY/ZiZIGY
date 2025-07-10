import { cva } from 'class-variance-authority';

export { default as NavigationMenu } from './NavigationMenu.vue';
export { default as NavigationMenuContent } from './NavigationMenuContent.vue';
export { default as NavigationMenuIndicator } from './NavigationMenuIndicator.vue';
export { default as NavigationMenuItem } from './NavigationMenuItem.vue';
export { default as NavigationMenuLink } from './NavigationMenuLink.vue';
export { default as NavigationMenuList } from './NavigationMenuList.vue';
export { default as NavigationMenuTrigger } from './NavigationMenuTrigger.vue';
export { default as NavigationMenuViewport } from './NavigationMenuViewport.vue';

export const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/10 hover:text-primary focus:bg-white/10 focus:text-primary disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-white/10 data-[state=open]:text-primary data-[state=open]:focus:bg-white/10 data-[state=open]:bg-white/5 focus-visible:ring-primary/30 outline-none transition-all duration-200 focus-visible:ring-[3px] focus-visible:outline-1'
);
