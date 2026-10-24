<script setup lang="ts">
const { t } = useI18n()
const { otherLocales, switchTo } = useLocaleSwitch()
</script>

<template>
  <button
    v-for="item in otherLocales"
    :key="item.code"
    type="button"
    class="h-9 min-w-9 rounded-full px-2 text-[0.8125rem] font-semibold tracking-wide transition-colors hover:bg-current/10"
    :lang="item.language"
    :title="t('locale.switch')"
    @click="switchTo(item.code)"
  >
    {{ item.code.toUpperCase() }}
  </button>
</template>
