<template>
  <!-- vue-dnd-kit at work: a card is picked up, carried across the board and dropped into another column -->
  <div class="stage">
    <div data-depth="0.6">
      <div class="board">
        <div
          v-for="column in 3"
          :key="column"
          class="column"
          :class="{ 'is-target': column === 3 }"
        >
          <span class="column-head"><i /><b /></span>
          <span
            v-for="card in column === 2 ? 3 : 2"
            :key="card"
            class="card"
          >
            <i class="w-[70%]" /><i class="w-[45%]" />
          </span>
          <span
            v-if="column === 3"
            class="slot"
          />
        </div>

        <span class="ghost-origin" />
        <span class="dragged">
          <span class="card is-lifted">
            <i class="w-[70%]" /><i class="w-[45%]" />
            <b class="tag" />
          </span>
          <svg
            class="hand"
            viewBox="0 0 24 24"
            fill="currentColor"
          ><path d="M5 3l14 8-6 1.5L10 19z" /></svg>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$loop: 4.2s;

.stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  container-type: size;
}

.board {
  --w: min(82cqw, 140cqh);
  --gap: 2.2cqmin;
  --col: calc((var(--w) - 2 * var(--gap)) / 3);
  --card-h: 11cqmin;
  --head: 7cqmin;

  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap);
  width: var(--w);
}

.column {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.6cqmin;
  min-height: 50cqmin;
  padding: 1.8cqmin;
  border-radius: 2.6cqmin;
  background: rgb(255 255 255 / 0.5);
  box-shadow: inset 0 0 0 1px rgb(14 14 18 / 0.06);

  // the drop target lights up while the card is over it (an outline that fades, not an animated shadow)
  &.is-target::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 0.35cqmin var(--color-ink);
    opacity: 0;
    animation: target $loop var(--ease-in-out-quart) infinite alternate;
  }
}

.column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(var(--head) - 1.6cqmin);

  i {
    width: 45%;
    height: 1.8cqmin;
    border-radius: 99px;
    background: var(--color-ink);
  }

  b {
    width: 3cqmin;
    height: 3cqmin;
    border-radius: 50%;
    background: var(--color-signal);
  }
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.2cqmin;
  height: var(--card-h);
  padding-inline: 1.8cqmin;
  border-radius: 1.8cqmin;
  background: #fff;
  box-shadow: 0 0.4rem 1rem -0.5rem rgb(14 14 18 / 0.25);

  i {
    height: 1.4cqmin;
    border-radius: 99px;
    background: rgb(14 14 18 / 0.75);

    & + i {
      background: rgb(14 14 18 / 0.2);
    }
  }
}

.tag {
  position: absolute;
  right: 1.8cqmin;
  top: 1.8cqmin;
  width: 6cqmin;
  height: 2cqmin;
  border-radius: 99px;
  background: var(--color-signal);
}

// dashed placeholder the card leaves behind / aims for
.slot,
.ghost-origin {
  height: var(--card-h);
  border: 0.3cqmin dashed rgb(14 14 18 / 0.35);
  border-radius: 1.8cqmin;
}

.slot {
  animation: appear $loop var(--ease-in-out-quart) infinite alternate;
}

.ghost-origin {
  position: absolute;
  left: 1.8cqmin;
  top: calc(1.8cqmin + var(--head) + 2 * (var(--card-h) + 1.6cqmin));
  width: calc(var(--col) - 3.6cqmin);
  animation: appear $loop var(--ease-in-out-quart) infinite alternate;
}

// the carried card starts under the first column's cards and ends in the third column's slot
.dragged {
  position: absolute;
  left: 1.8cqmin;
  top: calc(1.8cqmin + var(--head) + 2 * (var(--card-h) + 1.6cqmin));
  width: calc(var(--col) - 3.6cqmin);
  animation: carry $loop var(--ease-in-out-quart) infinite alternate;
}

// the shadow stays put: only scale and rotation move, so the lift stays on the compositor
.is-lifted {
  box-shadow: 0 1.2rem 2rem -1rem rgb(14 14 18 / 0.4);
  animation: lift $loop var(--ease-in-out-quart) infinite alternate;
}

.hand {
  position: absolute;
  right: 18%;
  bottom: -32%;
  width: clamp(1.25rem, 3.4cqmin, 2rem);
  color: var(--color-ink);
  filter: drop-shadow(0 0.25rem 0.4rem rgb(14 14 18 / 0.3));
}

// same row in both columns, so the path is a flat arc: up while crossing, down into the slot
@keyframes carry {
  0%,
  18% {
    translate: 0 0;
  }

  50% {
    translate: calc(var(--col) + var(--gap)) -7cqmin;
  }

  82%,
  100% {
    translate: calc(2 * (var(--col) + var(--gap))) 0;
  }
}

@keyframes lift {
  0%,
  12% {
    scale: 1;
    rotate: 0deg;
  }

  22%,
  78% {
    scale: 1.06;
    rotate: -5deg;
  }

  88%,
  100% {
    scale: 1;
    rotate: 0deg;
  }
}

@keyframes target {
  0%,
  40% {
    opacity: 0;
  }

  60%,
  100% {
    opacity: 1;
  }
}

@keyframes appear {
  0%,
  30% {
    opacity: 0;
  }

  45%,
  100% {
    opacity: 1;
  }
}

// the dark theme puts the board on a warm near-black card: dim columns, dark cards, light bars
.stage {
  @include dark {
    .column {
      background: rgb(255 255 255 / 0.05);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.07);

      &.is-target::after {
        box-shadow: inset 0 0 0 0.35cqmin var(--color-signal);
      }
    }

    .column-head i {
      background: var(--color-paper);
    }

    .card {
      background: #322e28;
      box-shadow: 0 0.4rem 1rem -0.5rem rgb(0 0 0 / 0.5);

      i {
        background: rgb(242 241 237 / 0.8);

        & + i {
          background: rgb(242 241 237 / 0.25);
        }
      }
    }

    .slot,
    .ghost-origin {
      border-color: rgb(242 241 237 / 0.3);
    }

    .hand {
      color: var(--color-paper);
    }
  }
}

@include reduced-motion {
  .column.is-target::after,
  .slot,
  .ghost-origin,
  .dragged,
  .is-lifted {
    animation: none;
  }

  .ghost-origin,
  .slot {
    opacity: 0;
  }
}
</style>
