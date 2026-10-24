<script setup lang="ts">
import { gsap } from 'gsap'

/*
 * A tiny Vue component, shown as source and running next to it: press the button in the preview and
 * the `count++` line lights up while the value written after `ref(0)` follows along.
 */
const { t } = useI18n()

type Kind = 'tag' | 'attr' | 'str' | 'kw' | 'fn' | 'plain' | 'mustache'
type Token = [Kind, string]

// a literal closing script tag would end this SFC's own <script> block, so it is put together here
const SCRIPT_END = ['<', '/script>'].join('')

// the source, token by token (rendered with v-text, so the mustaches stay text)
const lines: Token[][] = [
  [['tag', '<script'], ['attr', ' setup lang'], ['plain', '='], ['str', '"ts"'], ['tag', '>']],
  [['kw', 'const'], ['plain', ' count = '], ['fn', 'ref'], ['plain', '(0)']],
  [['tag', SCRIPT_END]],
  [],
  [['tag', '<template>']],
  [['plain', '  '], ['tag', '<button'], ['attr', ' @click'], ['plain', '='], ['str', '"count++"'], ['tag', '>']],
  [['plain', '    '], ['mustache', '{{ label }} {{ count }}']],
  [['plain', '  '], ['tag', '</button>']],
  [['tag', '</template>']],
]
const STATE_LINE = 1
const HANDLER_LINE = 5

const count = ref(0)
const hit = ref(false)
const bumps = ref<number[]>([])
let bumpId = 0
let hitTimer: ReturnType<typeof setTimeout> | undefined

function press() {
  count.value++
  hit.value = true
  clearTimeout(hitTimer)
  hitTimer = setTimeout(() => (hit.value = false), 600)
  const id = ++bumpId
  bumps.value.push(id)
  setTimeout(() => (bumps.value = bumps.value.filter(bump => bump !== id)), 900)
}

onBeforeUnmount(() => clearTimeout(hitTimer))

const root = useTemplateRef<HTMLElement>('root')

// the lines type themselves in, top to bottom, the first time the editor scrolls into view
useGsap(({ reduceMotion }) => {
  if (reduceMotion) return
  gsap.from('.code-line', {
    clipPath: 'inset(0 100% 0 0)',
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.07,
    scrollTrigger: { trigger: root.value, start: 'top 80%', once: true },
  })
}, root)
</script>

<template>
  <div
    ref="root"
    class="code-demo"
  >
    <div class="editor">
      <div class="editor-bar">
        <i /><i /><i />
        <span class="editor-tab">Counter.vue</span>
      </div>
      <ol class="editor-code">
        <li
          v-for="(line, index) in lines"
          :key="index"
          class="code-line"
          :class="{ 'is-hit': hit && index === HANDLER_LINE }"
        >
          <span class="code-no">{{ index + 1 }}</span>
          <span
            v-for="([kind, text], tokenIndex) in line"
            :key="tokenIndex"
            :class="`tk-${kind}`"
            v-text="text"
          />
          <span
            v-if="index === STATE_LINE"
            class="code-live"
          >// {{ count }}</span>
        </li>
      </ol>
    </div>

    <div class="preview">
      <span class="preview-label">{{ t('services.demo.preview') }}</span>
      <button
        type="button"
        class="preview-button"
        @click="press"
      >
        {{ t('services.demo.press') }}
        <span class="preview-count tabular-nums">{{ count }}</span>
        <span
          v-for="bump in bumps"
          :key="bump"
          class="preview-bump"
          aria-hidden="true"
        >+1</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.code-demo {
  display: grid;
  gap: 0.75rem;

  @include up(md) {
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  }
}

.editor,
.preview {
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.04);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
}

.editor {
  overflow: hidden;
}

.editor-bar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid rgb(255 255 255 / 0.07);

  i {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.18);
  }
}

.editor-tab {
  margin-left: 0.6rem;
  padding: 0.2rem 0.6rem;
  border-radius: 0.4rem;
  background: rgb(255 255 255 / 0.06);
  font-size: 0.75rem;
  color: rgb(242 241 237 / 0.75);
}

.editor-code {
  padding: 0.9rem 0;
  font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  font-size: clamp(0.72rem, 1vw, 0.9rem);
  line-height: 1.8;
  white-space: pre;
}

.code-line {
  position: relative;
  min-height: 1.75em;
  padding-right: 1rem;
  transition: background-color 0.4s;

  &.is-hit {
    background: rgb(255 79 26 / 0.16);
    transition-duration: 0s;
  }
}

.code-no {
  display: inline-block;
  width: 2.6em;
  padding-right: 1em;
  text-align: right;
  color: rgb(242 241 237 / 0.25);
  user-select: none;
}

.tk-tag { color: #8f949c; }
.tk-attr { color: #d9d7d0; }
.tk-str { color: #e6c79a; }
.tk-kw { color: var(--color-signal); }
.tk-fn { color: #9fc3ff; }
.tk-plain { color: rgb(242 241 237 / 0.88); }
.tk-mustache { color: #e6c79a; }

.code-live {
  margin-left: 1em;
  color: var(--color-signal);
}

.preview {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 10rem;
  padding: 1.25rem;
  background:
    radial-gradient(circle at 50% 120%, rgb(255 79 26 / 0.18), transparent 60%),
    rgb(255 255 255 / 0.04);
}

.preview-label {
  position: absolute;
  left: 0.9rem;
  top: 0.75rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(242 241 237 / 0.45);
}

.preview-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  height: 3.25rem;
  padding: 0 0.55rem 0 1.4rem;
  border-radius: 99px;
  background: var(--color-paper);
  color: var(--color-ink);
  font-weight: 600;
  // fast pressing would otherwise select text across the page (a double/triple click)
  user-select: none;
  transition: scale 0.25s var(--ease-out-expo);

  &:active {
    scale: 0.95;
  }
}

.preview-count {
  display: grid;
  place-items: center;
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0 0.5rem;
  border-radius: 99px;
  background: var(--color-signal);
  font-family: var(--font-display);
}

.preview-bump {
  position: absolute;
  right: 0.9rem;
  top: -0.25rem;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-signal);
  pointer-events: none;
  animation: bump 0.9s var(--ease-out-expo) forwards;
}

@keyframes bump {
  to {
    translate: 0.4rem -2.2rem;
    opacity: 0;
  }
}
</style>
