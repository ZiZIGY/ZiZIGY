<script setup lang="ts">
// AI sheets are messy: sprites sit off-centre in their cells. The offsets are fixed so SSR and client agree.
const sprites = [
  { x: 8, y: -6, hue: 'signal' },
  { x: -10, y: 4, hue: 'stone' },
  { x: 4, y: 10, hue: 'paper' },
  { x: -6, y: -10, hue: 'signal' },
  { x: 12, y: 6, hue: 'paper' },
  { x: -4, y: -4, hue: 'stone' },
  { x: 0, y: 12, hue: 'signal' },
  { x: -12, y: -2, hue: 'paper' },
] as const
</script>

<template>
  <!-- SpriteCutter at work: a scanner sweeps the sheet, boxes snap around each sprite, the cut frames play -->
  <div class="stage">
    <div
      class="sheet"
      data-depth="0.6"
    >
      <div class="grid">
        <span
          v-for="(sprite, index) in sprites"
          :key="index"
          class="cell"
          :style="{ '--x': `${sprite.x}%`, '--y': `${sprite.y}%`, '--col': index % 4 }"
        >
          <span
            class="sprite"
            :class="`is-${sprite.hue}`"
          ><i /><i /></span>
          <span class="box" />
        </span>
      </div>
      <span class="scan" />
    </div>

    <div
      class="preview"
      data-depth="1.3"
    >
      <span class="sprite is-signal is-playing"><i /><i /></span>
      <span class="frames"><b /><b /><b /><b /></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
$scan: 3.6s;

.stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  container-type: size;
}

.sheet {
  position: relative;
  width: min(72cqw, 120cqh);
  padding: 3cqmin;
  border-radius: 3cqmin;
  background: var(--color-ink);
  overflow: hidden;
  box-shadow: 0 2.5rem 5rem -2rem rgb(14 14 18 / 0.55);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.4cqmin;
}

.cell {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border-radius: 1.2cqmin;
  background:
    linear-gradient(45deg, rgb(255 255 255 / 0.04) 25%, transparent 25% 75%, rgb(255 255 255 / 0.04) 75%) 0 0 / 2.4cqmin 2.4cqmin,
    linear-gradient(45deg, rgb(255 255 255 / 0.04) 25%, transparent 25% 75%, rgb(255 255 255 / 0.04) 75%) 1.2cqmin 1.2cqmin / 2.4cqmin 2.4cqmin;
}

// a little wisp: round body, two eyes
.sprite {
  position: relative;
  display: block;
  width: 46%;
  aspect-ratio: 1;
  border-radius: 50% 50% 42% 42%;
  translate: var(--x, 0) var(--y, 0);

  &.is-signal {
    background: var(--color-signal);
  }

  &.is-stone {
    background: var(--color-graphite);
  }

  &.is-paper {
    background: var(--color-paper);
  }

  i {
    position: absolute;
    top: 38%;
    width: 14%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--color-ink);

    &:first-child {
      left: 28%;
    }

    &:last-child {
      right: 28%;
    }
  }
}

// the detected bounds hug the sprite, not the cell
.box {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 60%;
  aspect-ratio: 1;
  margin: -30% 0 0 -30%;
  // % in translate is of the element's own size: rescale the sprite's offset (46% wide) to the box (60%)
  translate: calc(var(--x) * 0.77) calc(var(--y) * 0.77);
  border: 0.3cqmin dashed var(--color-signal);
  border-radius: 0.8cqmin;
  opacity: 0;
  animation: detect $scan steps(1) infinite;
  animation-delay: calc(var(--col) * #{$scan} / 5);
}

.scan {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0.4cqmin;
  background: var(--color-signal);
  box-shadow: 0 0 2cqmin 0.4cqmin rgb(255 79 26 / 0.55);
  animation: scan $scan linear infinite;
}

.preview {
  position: absolute;
  right: 8%;
  bottom: 10%;
  display: grid;
  justify-items: center;
  gap: 1.4cqmin;
  width: 16cqmin;
  padding: 2.4cqmin 2cqmin 1.8cqmin;
  border-radius: 2.4cqmin;
  background: #fff;
  box-shadow: 0 1.5rem 3rem -1rem rgb(14 14 18 / 0.4);

  .sprite {
    width: 60%;
  }
}

// the exported animation: four frames of a bob
.is-playing {
  animation: bob 0.8s steps(4) infinite;
}

.frames {
  display: flex;
  gap: 0.8cqmin;

  b {
    width: 1.6cqmin;
    height: 1.6cqmin;
    border-radius: 0.4cqmin;
    background: rgb(14 14 18 / 0.15);
    animation: frame 0.8s steps(1) infinite;

    @for $i from 1 through 4 {
      &:nth-child(#{$i}) {
        animation-delay: #{($i - 1) * 0.2}s;
      }
    }
  }
}

@keyframes scan {
  from {
    translate: 0 0;
  }

  to {
    translate: min(72cqw, 120cqh) 0;
  }
}

// each column's boxes appear as the scanner passes and stay until the next sweep
@keyframes detect {
  0% {
    opacity: 1;
  }

  80% {
    opacity: 0;
  }
}

@keyframes bob {
  from {
    translate: 0 0;
  }

  to {
    translate: 0 -40%;
  }
}

@keyframes frame {
  0% {
    background: var(--color-signal);
  }

  25% {
    background: rgb(14 14 18 / 0.15);
  }
}

@include reduced-motion {
  .box,
  .scan,
  .is-playing,
  .frames b {
    animation: none;
  }

  .box {
    opacity: 1;
  }
}
</style>
