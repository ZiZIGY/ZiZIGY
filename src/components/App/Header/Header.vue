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
  } from '@heroicons/vue/24/outline';
  import { Button } from '@/components/UI/Button';
  import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
  } from '@/components/UI/NavigationMenu';

  import * as Decoration from '@/components/UI/Decoration';
  import { GlassmorphismCard } from '@/components/UI/GlassmorphismCard';

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
</script>

<template>
  <GlassmorphismCard
    class="!fixed top-0 left-0 w-full z-50 py-4 backdrop-blur-md bg-dark/40 shadow-lg border-b border-white/10 rounded-none"
  >
    <header>
      <div class="container mx-auto px-4 relative z-10">
        <nav class="flex justify-between items-center">
          <!-- Десктопная навигация -->
          <NavigationMenu class="hidden md:flex">
            <NavigationMenuList class="gap-0">
              <NavigationMenuItem
                v-for="(link, index) in navLinks"
                :key="index"
              >
                <Decoration.Link>
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
                </Decoration.Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

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
  </GlassmorphismCard>
</template>
