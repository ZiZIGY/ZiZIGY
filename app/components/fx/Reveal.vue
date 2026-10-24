<script setup lang="ts">
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

const props = withDefaults(defineProps<{
  text: string
  as?: string
  /** What rises out of the mask: chars inside their word, or words/lines inside their line. */
  by?: 'chars' | 'words' | 'lines'
  stagger?: number
  delay?: number
  duration?: number
  /** ScrollTrigger start, or `false` to play right after mount. */
  start?: string | false
}>(), {
  as: 'span',
  by: 'words',
  stagger: undefined,
  delay: 0,
  duration: 1.2,
  start: 'top 88%',
})

const el = useTemplateRef<HTMLElement>('el')

useGsap(({ reduceMotion }) => {
  const target = el.value
  if (reduceMotion || !target) return

  SplitText.create(target, {
    type: props.by === 'chars' ? 'words,chars' : props.by === 'words' ? 'lines,words' : 'lines',
    mask: props.by === 'chars' ? 'words' : 'lines',
    linesClass: 'split-line',
    wordsClass: 'split-word',
    charsClass: 'split-char',
    // re-split when fonts load or the width changes; the returned tween keeps its progress
    autoSplit: true,
    onSplit: self => gsap.from(self[props.by], {
      yPercent: 120,
      rotate: props.by === 'lines' ? 0 : 7,
      transformOrigin: '0% 100%',
      duration: props.duration,
      ease: 'expo.out',
      stagger: props.stagger ?? (props.by === 'chars' ? 0.022 : 0.07),
      delay: props.delay,
      scrollTrigger: props.start === false ? undefined : { trigger: target, start: props.start, once: true },
    }),
  })
}, el, { deps: () => props.text })
</script>

<template>
  <!-- textContent, not a child text node: Vue then rewrites the whole element, which is what a re-split needs -->
  <component
    :is="as"
    ref="el"
    v-bind="{ textContent: text }"
  />
</template>
