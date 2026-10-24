<script setup lang="ts">
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

const { t, locale } = useI18n()
const title = useTemplateRef<HTMLElement>('title')

useGsap(({ reduceMotion }) => {
  const heading = title.value
  if (!heading || reduceMotion) return
  const words = gsap.utils.toArray<HTMLElement>('.st-words', heading)
    .flatMap(part => SplitText.create(part, { type: 'words', wordsClass: 'split-word', aria: 'none' }).words)
  gsap.timeline({ scrollTrigger: { trigger: heading, start: 'top 85%', end: 'bottom 45%', scrub: true } })
    .fromTo(words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: 'none' })
    .fromTo('.st-mark', { '--mark': 0 }, { '--mark': 1, 'ease': 'power2.inOut', 'duration': 0.8 }, '-=0.9')
}, title, { deps: locale })
</script>

<template>
  <h2
    ref="title"
    class="statement"
    :aria-label="`${t('about.titleBefore')} ${t('about.titleHighlight')} ${t('about.titleAfter')}`"
  >
    <span
      class="st-words"
      aria-hidden="true"
      v-text="t('about.titleBefore')"
    />{{ ' ' }}<mark
      class="st-mark"
      aria-hidden="true"
    ><span
      class="st-words"
      v-text="t('about.titleHighlight')"
    /></mark>{{ ' ' }}<span
      class="st-words"
      aria-hidden="true"
      v-text="t('about.titleAfter')"
    />
  </h2>
</template>

<style scoped>
.statement {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3.3vw, 3.5rem);
  font-weight: 600;
  line-height: 1.14;
  letter-spacing: -0.035em;
}

.st-mark {
  --mark: 1;
  /* text turns ink as soon as the marker is under it — readable on signal in both themes */
  color: color-mix(in srgb, var(--color-ink) calc(clamp(0, (var(--mark) - 0.25) * 4, 1) * 100%), currentColor);
  background: linear-gradient(var(--color-signal), var(--color-signal)) no-repeat 0 0 / calc(var(--mark) * 100%) 100%;
  padding-inline: 0.08em;
  margin-inline: -0.04em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
</style>
