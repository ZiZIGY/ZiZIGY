<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useLocalStorage } from '@vueuse/core';
  import { ref } from 'vue';

  import {
    HomeIcon,
    UserIcon,
    CodeBracketIcon,
    RectangleStackIcon,
    EnvelopeIcon,
    LanguageIcon,
    Bars3Icon,
    XMarkIcon,
  } from '@heroicons/vue/24/outline';
  import { Button } from '@/components/UI/Button';
  import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
  } from '@/components/UI/NavigationMenu';
  import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerClose,
    DrawerFooter,
  } from '@/components/UI/Drawer';

  const { t, locale } = useI18n();
  const savedLocale = useLocalStorage('locale', 'ru');
  const isDrawerOpen = ref(false);

  const toggleLocale = () => {
    locale.value = locale.value === 'ru' ? 'en' : 'ru';
    savedLocale.value = locale.value;
  };

  const navLinks = [
    { name: 'header.home', href: '#', icon: HomeIcon },
    { name: 'header.about', href: '#about', icon: UserIcon },
    { name: 'header.techStack', href: '#tech-stack', icon: CodeBracketIcon },
    { name: 'header.projects', href: '#projects', icon: RectangleStackIcon },
    { name: 'header.contact', href: '#contact', icon: EnvelopeIcon },
  ];

  const closeDrawer = () => {
    isDrawerOpen.value = false;
  };
</script>

<template>
  <header
    class="fixed top-0 left-0 w-full z-50 py-4 backdrop-blur-md bg-dark/40 shadow-lg border-b border-white/10"
  >
    <div class="container mx-auto px-4 relative z-10">
      <nav class="flex justify-between items-center">
        <!-- Десктопная навигация -->
        <NavigationMenu class="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem
              v-for="(link, index) in navLinks"
              :key="index"
            >
              <NavigationMenuLink
                :href="link.href"
                :class="navigationMenuTriggerStyle()"
              >
                <div class="flex items-center gap-2">
                  <component
                    :is="link.icon"
                    class="w-4 h-4"
                  />
                  <span>{{ t(link.name) }}</span>
                </div>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <!-- Мобильная навигация -->
        <div class="md:hidden">
          <Drawer
            v-model:open="isDrawerOpen"
            direction="left"
          >
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                class="text-white"
              >
                <Bars3Icon class="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent
              class="bg-dark/95 border-l border-white/10 backdrop-blur-md"
            >
              <DrawerHeader>
                <DrawerTitle class="text-white">{{
                  t('header.menu')
                }}</DrawerTitle>
              </DrawerHeader>
              <div class="px-4 py-2">
                <ul class="space-y-4">
                  <li
                    v-for="(link, index) in navLinks"
                    :key="index"
                  >
                    <a
                      :href="link.href"
                      class="flex items-center gap-3 text-white hover:text-primary transition-colors p-2 rounded-md hover:bg-white/10"
                      @click="closeDrawer"
                    >
                      <component
                        :is="link.icon"
                        class="w-5 h-5"
                      />
                      <span class="text-lg">{{ t(link.name) }}</span>
                    </a>
                  </li>
                </ul>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button
                    variant="outline"
                    class="w-full"
                  >
                    <div class="justify-center flex items-center gap-2">
                      <XMarkIcon class="w-5 h-5 mr-2" />
                      {{ t('common.close') }}
                    </div>
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

        <!-- Переключатель языка (только для десктопа) -->
        <Button
          @click="toggleLocale"
          class="ml-4 flex"
        >
          <div class="flex items-center gap-1">
            <LanguageIcon class="w-4 h-4" />
            <span>{{ locale.toUpperCase() }}</span>
          </div>
        </Button>
      </nav>
    </div>
  </header>
</template>
