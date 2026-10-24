<script setup lang="ts">
import { gsap } from 'gsap'

const out = useTemplateRef<HTMLElement>('out')

let frames = 0
let since = 0
function tick() {
  frames++
  const now = performance.now()
  if (!since) since = now
  if (now - since < 500) return
  if (out.value) out.value.textContent = String(Math.min(240, Math.round((frames * 1000) / (now - since))))
  frames = 0
  since = now
}

onMounted(() => gsap.ticker.add(tick))
onBeforeUnmount(() => gsap.ticker.remove(tick))
</script>

<template>
  <span
    ref="out"
    class="tabular-nums"
  >60</span>
</template>
