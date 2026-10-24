<script setup lang="ts">
/*
 * A small kanban board that really works: pick a card up, carry it across, drop it into another
 * column — it glides into the free slot and the counts update; cards in the last column tick off.
 */
const { t } = useI18n()
const tList = useTList()
const columns = computed(() => tList('services.demo.columns'))

interface Card { id: number, col: number, bars: [number, number], accent?: boolean }
const cards = ref<Card[]>([
  { id: 1, col: 0, bars: [72, 44], accent: true },
  { id: 2, col: 0, bars: [58, 36] },
  { id: 3, col: 1, bars: [66, 40] },
])

const rowOf = (card: Card) => cards.value.filter(other => other.col === card.col).indexOf(card)
const countIn = (col: number) => cards.value.filter(card => card.col === col).length

const board = useTemplateRef<HTMLElement>('board')
const held = ref<number | null>(null)
const offset = reactive({ x: 0, y: 0 })
const target = ref<number | null>(null)
let start = { x: 0, y: 0 }

function columnAt(clientX: number) {
  const rect = board.value!.getBoundingClientRect()
  return Math.min(2, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * 3)))
}

function grab(card: Card, event: PointerEvent) {
  held.value = card.id
  start = { x: event.clientX, y: event.clientY }
  offset.x = 0
  offset.y = 0
  target.value = card.col
  ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
}

function move(event: PointerEvent) {
  if (held.value === null) return
  offset.x = event.clientX - start.x
  offset.y = event.clientY - start.y
  target.value = columnAt(event.clientX)
}

function drop() {
  const card = cards.value.find(item => item.id === held.value)
  if (card && target.value !== null && target.value !== card.col) {
    // to the bottom of the new column
    cards.value = [...cards.value.filter(item => item !== card), { ...card, col: target.value }]
  }
  held.value = null
  target.value = null
  offset.x = 0
  offset.y = 0
}
</script>

<template>
  <div class="board-demo">
    <div
      ref="board"
      class="board"
    >
      <div
        v-for="(name, col) in columns"
        :key="name"
        class="board-col"
        :class="{ 'is-target': held !== null && target === col }"
      >
        <span class="board-head">
          {{ name }}
          <b class="tabular-nums">{{ countIn(col) }}</b>
        </span>
      </div>

      <span
        v-for="card in cards"
        :key="card.id"
        class="board-card"
        :class="{ 'is-held': held === card.id, 'is-done': card.col === 2 }"
        :style="{
          '--col': card.col,
          '--row': rowOf(card),
          'translate': held === card.id ? `${offset.x}px ${offset.y}px` : undefined,
        }"
        data-cursor="drag"
        @pointerdown="grab(card, $event)"
        @pointermove="move"
        @pointerup="drop"
        @pointercancel="drop"
      >
        <span class="card-bars">
          <i :style="{ width: `${card.bars[0]}%` }" />
          <i :style="{ width: `${card.bars[1]}%` }" />
        </span>
        <span
          class="card-mark"
          :class="{ 'is-accent': card.accent }"
        />
      </span>
    </div>
    <p class="board-hint">
      {{ t('services.demo.board') }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.board-demo {
  display: grid;
  gap: 0.9rem;
}

// three columns; the cards are laid out on top of them by column and row
.board {
  --head: 2.4rem;
  --card-h: 2.9rem;
  --gap: 0.5rem;

  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  height: calc(var(--head) + 3 * (var(--card-h) + var(--gap)) + 0.25rem);
  touch-action: none;
  user-select: none;
}

.board-col {
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--foreground) 4%, transparent);
  box-shadow: inset 0 0 0 1px var(--border);
  transition: box-shadow 0.3s, background-color 0.3s;

  &.is-target {
    background: rgb(255 79 26 / 0.08);
    box-shadow: inset 0 0 0 1.5px var(--color-signal);
  }
}

.board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--head);
  padding: 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;

  b {
    display: grid;
    place-items: center;
    min-width: 1.25rem;
    height: 1.25rem;
    border-radius: 99px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    font-size: 0.6875rem;
  }
}

.board-card {
  position: absolute;
  // one column is a third of the board minus the grid gaps; the card sits inside it with a margin
  left: calc(var(--col) * ((100% - 1rem) / 3 + 0.5rem) + 0.4rem);
  top: calc(var(--head) + var(--row) * (var(--card-h) + var(--gap)));
  width: calc((100% - 1rem) / 3 - 0.8rem);
  height: var(--card-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0 0.7rem;
  border-radius: 0.7rem;
  background: var(--card);
  box-shadow: 0 0.35rem 0.9rem -0.5rem rgb(17 17 19 / 0.3), inset 0 0 0 1px var(--border);
  cursor: grab;
  transition:
    left 0.5s var(--ease-spring),
    top 0.5s var(--ease-spring),
    translate 0.5s var(--ease-spring),
    rotate 0.4s var(--ease-out-expo),
    scale 0.4s var(--ease-out-expo);

  &.is-held {
    z-index: 2;
    scale: 1.05;
    rotate: -4deg;
    cursor: grabbing;
    box-shadow: 0 1.2rem 2rem -1rem rgb(17 17 19 / 0.45), inset 0 0 0 1px var(--border);
    transition: rotate 0.3s var(--ease-out-expo), scale 0.3s var(--ease-out-expo);
  }
}

.card-bars {
  display: grid;
  flex: 1;
  gap: 0.3rem;

  i {
    height: 0.3rem;
    border-radius: 99px;
    background: color-mix(in srgb, var(--foreground) 70%, transparent);
    transition: opacity 0.3s;

    & + i {
      background: color-mix(in srgb, var(--foreground) 22%, transparent);
    }
  }
}

.card-mark {
  flex: none;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--foreground) 35%, transparent);
  transition: background-color 0.3s, box-shadow 0.3s;

  &.is-accent {
    box-shadow: inset 0 0 0 1.5px var(--color-signal);
  }
}

// done: the bars fade and the mark fills in
.is-done {
  .card-bars i {
    opacity: 0.4;
  }

  .card-mark {
    background: var(--color-signal);
    box-shadow: none;
  }
}

.board-hint {
  font-size: 0.8125rem;
  color: var(--muted-foreground);
}
</style>
