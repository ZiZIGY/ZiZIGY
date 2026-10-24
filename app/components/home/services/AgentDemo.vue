<script setup lang="ts">
import { Check, RotateCcw } from '@lucide/vue'

/*
 * An AI agent at work, in miniature: the request types itself in, then the agent's steps stream in
 * one by one (a spinner while a step runs, a check when it's done), and it ends waiting for review.
 * It plays the first time it comes into view; the button plays it again. The server renders the run
 * finished, and reduced motion keeps it that way.
 */
const { t } = useI18n()
const tList = useTList()

const prompt = computed(() => t('services.demo.agent.prompt'))
const steps = computed(() => tList('services.demo.agent.steps'))
// the step that edits the files carries its diff
const EDIT_STEP = 2
const DIFF = { added: 42, removed: 7 }

// how much of the prompt is typed, and the step running now (steps.length = all done)
const typed = ref(Number.POSITIVE_INFINITY)
const current = ref(Number.POSITIVE_INFINITY)
const running = ref(false)
const finished = computed(() => current.value >= steps.value.length)

const root = useTemplateRef<HTMLElement>('root')
const visible = useElementVisibility(root)
const reducedMotion = usePreferredReducedMotion()

// a newer run (or leaving the page) makes an older one stop where it is
let run = 0
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function play() {
  const id = ++run
  running.value = true
  typed.value = 0
  current.value = -1
  for (let i = 1; i <= prompt.value.length; i++) {
    await wait(32)
    if (id !== run) return
    typed.value = i
  }
  for (let step = 0; step <= steps.value.length; step++) {
    await wait(step ? 750 : 350)
    if (id !== run) return
    current.value = step
  }
  running.value = false
}

// it starts empty on the client and plays when first seen
onMounted(() => {
  if (reducedMotion.value === 'reduce') return
  typed.value = 0
  current.value = -1
})
const stop = watch(visible, (seen) => {
  if (!seen || reducedMotion.value === 'reduce') return
  stop()
  play()
})
onBeforeUnmount(() => {
  run++
})

const state = (index: number) => (index < current.value ? 'is-done' : index === current.value ? 'is-running' : 'is-pending')
</script>

<template>
  <div
    ref="root"
    class="agent"
  >
    <div class="agent-window">
      <p class="agent-prompt">
        <span class="text-signal">›</span>
        <span>{{ prompt.slice(0, typed) }}<i
          v-if="typed < prompt.length || current < 0"
          class="agent-caret"
          aria-hidden="true"
        /></span>
      </p>
      <ol class="agent-steps">
        <li
          v-for="(line, index) in steps"
          :key="index"
          class="agent-step"
          :class="state(index)"
        >
          <span
            class="agent-mark"
            aria-hidden="true"
          >
            <Check
              v-if="index < current"
              class="size-3"
            />
            <i
              v-else
              class="agent-spinner"
            />
          </span>
          <span class="min-w-0 truncate">{{ line }}</span>
          <b
            v-if="index === EDIT_STEP"
            class="agent-diff"
          ><span class="text-[#2f9e5b]">+{{ DIFF.added }}</span> <span class="text-signal">−{{ DIFF.removed }}</span></b>
        </li>
      </ol>
      <p
        class="agent-done"
        :class="{ 'is-on': finished }"
      >
        <span class="ping-dot" />
        {{ t('services.demo.agent.done') }}
      </p>
    </div>
    <button
      type="button"
      class="agent-replay"
      :disabled="running"
      :aria-label="t('services.demo.agent.replay')"
      @click="play()"
    >
      <RotateCcw class="size-3.5" />
      {{ t('services.demo.agent.replay') }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.agent {
  display: grid;
  gap: 0.75rem;
}

.agent-window {
  display: grid;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: var(--card);
  box-shadow: inset 0 0 0 1px var(--border);
  font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  font-size: 0.75rem;
  line-height: 1.4;
}

// room for two lines from the start, so the window doesn't grow when the typed request wraps
.agent-prompt {
  display: flex;
  gap: 0.5rem;
  min-height: 2.8em;
  font-weight: 600;
}

.agent-caret {
  display: inline-block;
  width: 0.45em;
  height: 1.05em;
  margin-left: 0.1em;
  vertical-align: -0.15em;
  background: var(--color-signal);
  animation: caret-blink 1s steps(1) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

.agent-steps {
  display: grid;
  gap: 0.45rem;
}

// a step that hasn't started is there but invisible, so the window never changes height
.agent-step {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  transition: opacity 0.35s, translate 0.45s var(--ease-out-expo);

  &.is-pending {
    opacity: 0;
    translate: 0 0.35rem;
  }

  &.is-running {
    color: var(--muted-foreground);
  }
}

.agent-mark {
  display: grid;
  flex: none;
  place-items: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--secondary);

  .is-done & {
    background: var(--foreground);
    color: var(--background);
  }
}

.agent-spinner {
  width: 0.6rem;
  height: 0.6rem;
  border: 1.5px solid var(--border);
  border-top-color: var(--color-signal);
  border-radius: 50%;
  animation: agent-spin 0.7s linear infinite;
}

@keyframes agent-spin {
  to {
    rotate: 1turn;
  }
}

.agent-diff {
  flex: none;
  margin-left: auto;
  font-weight: 600;
}

.agent-done {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.75rem;
  box-shadow: inset 0 1px 0 var(--border);
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.4s;

  &.is-on {
    opacity: 1;
  }
}

.agent-replay {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 0.45rem;
  min-height: 2.25rem;
  padding-inline: 0.85rem;
  border-radius: 99px;
  background: var(--card);
  box-shadow: inset 0 0 0 1px var(--border);
  font-size: 0.8125rem;
  font-weight: 600;
  transition: opacity 0.3s, background-color 0.3s;

  &:disabled {
    opacity: 0.45;
  }

  @include hover {
    &:not(:disabled) {
      background: var(--background);
    }
  }
}

@include reduced-motion {
  .agent-step {
    transition: none;
  }
}
</style>
