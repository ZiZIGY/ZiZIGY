<script setup lang="ts">
import { site } from '~/data/site'

const { locale } = useI18n()
const mounted = useMounted()
// VueUse 15: the tick rate is a scheduler; once a second is plenty for minutes
const now = useNow({ scheduler: callback => useIntervalFn(callback, 1000) })

// rendered only after mount: the server's clock would never match the visitor's first paint
const parts = computed(() => {
  if (!mounted.value) return null
  const formatted = new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: site.timeZone,
  }).formatToParts(now.value)
  return {
    hours: formatted.find(part => part.type === 'hour')?.value ?? '--',
    minutes: formatted.find(part => part.type === 'minute')?.value ?? '--',
  }
})
</script>

<template>
  <span class="tabular-nums">
    <template v-if="parts">{{ parts.hours }}<span class="blink">:</span>{{ parts.minutes }}</template>
    <template v-else>--:--</template>
  </span>
</template>

<style scoped>
.blink {
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0.2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .blink {
    animation: none;
  }
}
</style>
