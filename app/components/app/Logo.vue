<script setup lang="ts">
import { site } from '~/data/site'

const { scrollToSection } = useSectionNav()
const route = useRoute()

const letters = site.brand.split('')

function onClick(event: MouseEvent) {
  if (route.path !== '/') return
  event.preventDefault()
  scrollToSection('top')
}
</script>

<template>
  <NuxtLink
    to="/"
    class="logo font-display text-[1.25rem] leading-none font-bold tracking-[-0.04em]"
    :aria-label="`${site.brand} — home`"
    @click="onClick"
  >
    <!-- every letter is two stacked copies; on hover the stack rolls up, one letter after another -->
    <span
      v-for="(letter, index) in letters"
      :key="index"
      class="logo-letter"
      :style="{ '--i': index }"
      aria-hidden="true"
    >
      <span>{{ letter }}</span>
      <span>{{ letter }}</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: flex-start;
}

/* a little room on the sides: the negative tracking makes each letter's box narrower than its ink */
.logo-letter {
  display: inline-flex;
  flex-direction: column;
  height: 1.12em;
  padding-inline: 0.04em;
  margin-inline: -0.04em;
  line-height: 1.12em;
  overflow: clip;
}

.logo-letter > span {
  transition: translate 0.6s var(--ease-out-expo);
  transition-delay: calc(var(--i) * 35ms);
}

@media (hover: hover) {
  .logo:hover .logo-letter > span {
    translate: 0 -100%;
  }
}
</style>
