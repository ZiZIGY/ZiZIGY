<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const { t } = useI18n()
const { toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="grid size-9 place-items-center rounded-full transition-colors hover:bg-current/10"
    :aria-label="t('theme.toggle')"
    @click="toggle"
  >
    <!-- icons follow the `.dark` class on <html>, so SSR markup is right before color-mode resolves on the client -->
    <Sun class="hidden size-4.5 dark:block" />
    <Moon class="size-4.5 dark:hidden" />
  </button>
</template>
