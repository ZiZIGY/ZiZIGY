<template>
  <!-- Wispbringer: a lit orb with drifting meridians, a wisp orbiting in front and behind, sparks rising -->
  <div class="stage">
    <span class="glow" />
    <span
      v-for="spark in 7"
      :key="spark"
      class="spark"
      :style="{ '--i': spark, 'left': `${18 + ((spark * 53) % 64)}%` }"
    />
    <div
      class="system"
      data-depth="0.6"
    >
      <span class="planet">
        <span class="meridians" />
      </span>
      <span class="orbit-path" />
      <span class="moon-x">
        <span class="moon-y">
          <span class="moon" />
        </span>
      </span>
    </div>
    <span
      class="tag liquid-glass glass-on-dark"
      data-depth="1.4"
    >GLSL</span>
  </div>
</template>

<style scoped lang="scss">
$period: 9s;

.stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  container-type: size;
}

.glow {
  position: absolute;
  width: 110cqmin;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 96 40 / 0.42), rgb(255 79 26 / 0.12) 40%, transparent 68%);
}

.system {
  position: relative;
  width: 62cqmin;
  aspect-ratio: 1;
  translate: 0 18%;
}

.planet {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 50%;
  overflow: hidden;
  background: radial-gradient(circle at 34% 28%, #fff 0%, #ffe3d6 6%, #ffae8a 20%, #ff7344 42%, #ff4f1a 58%, #a83006 80%, #2a0b02 100%);
  box-shadow:
    inset -3rem -2.5rem 5rem rgb(30 8 2 / 0.55),
    0 0 6rem rgb(255 79 26 / 0.4);
}

// latitude-free stripes sliding sideways read as the sphere turning
.meridians {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(90deg, rgb(255 255 255 / 0.09) 0 2px, transparent 2px 11%);
  mask-image: radial-gradient(circle at 50% 50%, #000 40%, transparent 72%);
  animation: spin 7s linear infinite;
}

.orbit-path {
  position: absolute;
  left: -32%;
  right: -32%;
  top: 34%;
  bottom: 34%;
  border: 1px solid rgb(255 255 255 / 0.28);
  border-radius: 50%;
  rotate: -14deg;
}

// an ellipse from two eased oscillations a quarter-period apart
.moon-x {
  position: absolute;
  left: 50%;
  top: 50%;
  rotate: -14deg;
  animation: moon-z $period steps(1) infinite;
}

.moon-y {
  display: block;
  animation: moon-x calc($period / 2) ease-in-out infinite alternate;
}

.moon {
  display: block;
  width: 6cqmin;
  aspect-ratio: 1;
  margin: -3cqmin 0 0 -3cqmin;
  border-radius: 50%;
  background: var(--color-paper);
  box-shadow: 0 0 1.5rem rgb(255 255 255 / 0.55);
  animation: moon-y calc($period / 2) ease-in-out calc($period / -4) infinite alternate;
}

.tag {
  position: absolute;
  left: 7%;
  top: 9%;
  padding: 0.45rem 0.85rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
}

.spark {
  position: absolute;
  bottom: -4%;
  width: 1.2cqmin;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--color-signal-soft);
  box-shadow: 0 0 1.2cqmin rgb(255 115 68 / 0.8);
  opacity: 0;
  animation: rise 5s ease-in infinite;
  animation-delay: calc(var(--i) * -0.73s);
}

@keyframes rise {
  0% {
    opacity: 0;
    translate: 0 0;
  }

  15% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    translate: 3cqmin -70cqh;
  }
}

@keyframes spin {
  to {
    background-position: 11cqmin 0;
  }
}

@keyframes moon-x {
  from {
    translate: -51cqmin 0;
  }

  to {
    translate: 51cqmin 0;
  }
}

@keyframes moon-y {
  from {
    translate: 0 -9cqmin;
  }

  to {
    translate: 0 9cqmin;
  }
}

// front of the planet on the lower half of the orbit, behind it on the upper half
@keyframes moon-z {
  0% {
    z-index: 2;
  }

  50% {
    z-index: 0;
  }
}

@include reduced-motion {
  .spark {
    display: none;
  }

  .meridians,
  .moon-x,
  .moon-y,
  .moon {
    animation: none;
  }
}
</style>
