<script setup lang="ts">
import { navSections } from '~/data/site'
import type { NavSection } from '~/data/site'

const { t } = useI18n()
const ui = useUiStore()
const { scrollToSection } = useSectionNav()

const hovered = ref<NavSection | null>(null)
// hover previews the target; otherwise the pill rests on the section in view
const indicator = computed(() => hovered.value ?? ui.activeSection)

const hidden = ref(false)
const mounted = useMounted()

// hide while reading downwards, come back on the slightest scroll up.
// Lenis reports right away — before hydration — so nothing changes until mount: a page reloaded
// mid-scroll would otherwise hydrate with classes the server never rendered.
useLenis((lenis) => {
  if (!mounted.value) return
  if (ui.isMenuOpen || lenis.scroll < 160) hidden.value = false
  else if (lenis.direction === 1 && lenis.velocity > 0.6) hidden.value = true
  else if (lenis.direction === -1) hidden.value = false
})
</script>

<template>
  <!--
    One look over every section: each piece sits on its own smoked-glass pill (.glass-ink), which reads
    the same on paper, signal and ink — so the header never has to switch tone as the page moves under it.
  -->
  <header
    class="app-header fixed inset-x-0 top-0 z-50 text-paper transition-[translate] duration-700 ease-out-expo"
    :class="hidden ? 'translate-y-[-130%]' : 'translate-y-0'"
  >
    <div class="container-site relative flex h-(--header-h) items-center justify-between gap-4">
      <!-- the link fills the whole pill, so the tap target is the pill and not just the letters -->
      <div class="liquid-glass glass-refract glass-ink flex h-11 items-center rounded-full">
        <AppLogo class="px-4.5 py-2.5" />
      </div>

      <nav
        class="liquid-glass glass-refract glass-ink hidden items-center rounded-full p-1 lg:flex"
        :aria-label="t('nav.menu')"
        @pointerleave="hovered = null"
      >
        <a
          v-for="id in navSections"
          :key="id"
          :href="withBase(`/#${id}`)"
          class="relative rounded-full px-4.5 py-2 text-sm font-medium transition-colors duration-300"
          :class="indicator === id ? 'nav-active' : 'opacity-80 hover:opacity-100'"
          @pointerenter="hovered = id"
          @click.prevent="scrollToSection(id)"
        >
          <Motion
            v-if="indicator === id"
            as="span"
            layout-id="nav-indicator"
            class="nav-indicator absolute inset-0 rounded-full"
            :transition="{ type: 'spring', bounce: 0.22, duration: 0.55 }"
          />
          <span class="relative">{{ t(`nav.${id}`) }}</span>
        </a>
      </nav>

      <!-- the call to action rides inside the smoked pill, so it keeps a dark frame even on the signal hero -->
      <div class="liquid-glass glass-refract glass-ink flex items-center gap-1 rounded-full p-1">
        <AppLocaleSwitcher />
        <AppThemeToggle />
        <button
          type="button"
          class="burger grid size-9 place-items-center rounded-full lg:hidden"
          :class="{ 'is-open': ui.isMenuOpen }"
          :aria-label="ui.isMenuOpen ? t('nav.close') : t('nav.menu')"
          :aria-expanded="ui.isMenuOpen"
          @click="ui.isMenuOpen = !ui.isMenuOpen"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <Button
          as="a"
          :href="withBase('/#contact')"
          variant="signal"
          size="pill"
          class="hidden h-9 px-4 text-sm font-semibold sm:inline-flex"
          @click.prevent="scrollToSection('contact')"
        >
          {{ t('cta.discuss') }}
          <FxArrow />
        </Button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-indicator {
  background: var(--color-signal);
}

.nav-active {
  color: var(--color-ink);
}

/*
 * During page transitions the header stays put instead of fading with the page. Only while a route
 * transition runs: a view-transition-name makes the header a backdrop root, which would leave the glass
 * inside it nothing to refract.
 */
:root:active-view-transition:not(:active-view-transition-type(theme, locale)) .app-header {
  view-transition-name: site-header;
}

.burger {
  position: relative;
}

.burger span {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1rem;
  height: 1.5px;
  margin-left: -0.5rem;
  border-radius: 2px;
  background: currentColor;
  transition: translate 0.5s var(--ease-out-expo), rotate 0.5s var(--ease-out-expo);
}

.burger span:first-child {
  translate: 0 -3px;
}

.burger span:last-child {
  translate: 0 3px;
}

.burger.is-open span:first-child {
  translate: 0 0;
  rotate: 45deg;
}

.burger.is-open span:last-child {
  translate: 0 0;
  rotate: -45deg;
}
</style>
