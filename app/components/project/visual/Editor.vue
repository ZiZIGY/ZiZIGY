<template>
  <!-- the engine's editor: layers on the left, a live game viewport, and the AI agent answering on the right -->
  <div class="stage">
    <div data-depth="0.6">
      <div class="window">
        <div class="bar">
          <i /><i /><i />
          <span class="title" />
        </div>
        <div class="body">
          <div class="layers">
            <span
              v-for="layer in 5"
              :key="layer"
              class="layer"
              :class="{ 'is-active': layer === 2 }"
            ><b /><i /></span>
          </div>

          <div class="viewport">
            <span class="ground" />
            <span
              v-for="enemy in 5"
              :key="enemy"
              class="enemy"
              :style="{ '--i': enemy, 'top': `${12 + ((enemy * 37) % 70)}%` }"
            />
            <span class="wisp" />
          </div>

          <div class="chat">
            <span class="ai-label">AI</span>
            <span class="msg is-user"><i class="w-[80%]" /><i class="w-[50%]" /></span>
            <span class="msg is-typing"><b /><b /><b /></span>
            <span class="msg is-ai"><i class="w-[90%]" /><i class="w-[75%]" /><i class="w-[40%]" /></span>
            <span class="input" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$chat: 6s;

.stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  container-type: size;
}

.window {
  width: min(84cqw, 138cqh);
  aspect-ratio: 16 / 10;
  border-radius: min(2.4cqw, 1.25rem);
  background: #18181b;
  overflow: hidden;
  box-shadow: 0 2.5rem 5rem -2rem rgb(14 14 18 / 0.5);
  animation: float 8s ease-in-out infinite;
}

.bar {
  display: flex;
  align-items: center;
  gap: 1.1%;
  height: 7%;
  padding-inline: 2.4%;
  border-bottom: 1px solid rgb(255 255 255 / 0.06);

  i {
    width: 1.3%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.2);
  }
}

.title {
  width: 18%;
  height: 32%;
  margin-inline: auto;
  border-radius: 99px;
  background: rgb(255 255 255 / 0.08);
}

.body {
  display: grid;
  grid-template-columns: 18% 1fr 26%;
  gap: 2%;
  height: 93%;
  padding: 2%;
}

.layers {
  display: flex;
  flex-direction: column;
  gap: 4%;
}

.layer {
  display: flex;
  align-items: center;
  gap: 8%;
  height: 9%;
  padding-inline: 8%;
  border-radius: 0.5rem;

  b {
    width: 14%;
    aspect-ratio: 1;
    border-radius: 0.2rem;
    background: rgb(255 255 255 / 0.25);
  }

  i {
    flex: 1;
    height: 22%;
    border-radius: 99px;
    background: rgb(255 255 255 / 0.15);
  }

  &.is-active {
    background: rgb(255 79 26 / 0.16);

    b {
      background: var(--color-signal);
    }
  }
}

.viewport {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 120%, rgb(255 79 26 / 0.45), transparent 60%),
    linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px) 0 0 / 10% 14%,
    linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px) 0 0 / 10% 14%,
    #111113;
}

.ground {
  position: absolute;
  inset: auto 0 0;
  height: 18%;
  background: linear-gradient(to top, rgb(242 241 237 / 0.12), transparent);
}

// the player's wisp flies a figure eight, the enemies drift towards it
.wisp {
  position: absolute;
  left: 50%;
  top: 48%;
  width: 7%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #fff, var(--color-signal) 45%, rgb(255 79 26 / 0));
  box-shadow: 0 0 1.5rem 0.5rem rgb(255 79 26 / 0.45);
  animation: eight 5s ease-in-out infinite;
}

.enemy {
  position: absolute;
  left: calc(8% + var(--i) * 16%);
  width: 3.4%;
  aspect-ratio: 1;
  border-radius: 30%;
  background: var(--color-stone);
  animation: drift 3.2s ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * -0.7s);
}

.chat {
  display: flex;
  flex-direction: column;
  gap: 4%;
  padding: 6%;
  border-radius: 0.75rem;
  background: rgb(255 255 255 / 0.04);
}

.ai-label {
  align-self: flex-start;
  padding: 2% 8%;
  border-radius: 99px;
  background: var(--color-signal);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(0.5rem, 1.6cqmin, 0.75rem);
  font-weight: 700;
}

.msg {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 8%;
  border-radius: 0.75rem;

  i {
    height: 0.35rem;
    border-radius: 99px;
  }
}

.is-user {
  align-self: flex-end;
  width: 80%;
  background: rgb(255 255 255 / 0.1);
  animation: message $chat var(--ease-out-expo) infinite;

  i {
    background: rgb(255 255 255 / 0.4);
  }
}

.is-typing {
  flex-direction: row;
  align-self: flex-start;
  gap: 0.3rem;
  padding: 6% 9%;
  background: rgb(255 79 26 / 0.16);
  animation: typing $chat steps(1) infinite;

  b {
    width: 0.35rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--color-signal);
    animation: dot 0.9s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

.is-ai {
  width: 92%;
  background: var(--color-signal);
  animation: reply $chat var(--ease-out-expo) infinite;

  i {
    background: rgb(14 14 18 / 0.55);
  }
}

.input {
  height: 12%;
  margin-top: auto;
  border-radius: 99px;
  background: rgb(255 255 255 / 0.07);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
}

@keyframes float {
  50% {
    translate: 0 -2%;
  }
}

@keyframes eight {
  0%,
  100% {
    translate: 0 0;
  }

  25% {
    translate: 180% -120%;
  }

  50% {
    translate: 0 0;
  }

  75% {
    translate: -180% 120%;
  }
}

@keyframes drift {
  to {
    translate: 30% 60%;
    rotate: 45deg;
  }
}

// user asks → agent types → agent answers → fade and start over
@keyframes message {
  0%,
  4% {
    opacity: 0;
    translate: 0 30%;
  }

  12%,
  88% {
    opacity: 1;
    translate: 0 0;
  }

  96%,
  100% {
    opacity: 0;
  }
}

@keyframes typing {
  0% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  42% {
    opacity: 0;
    height: 0;
    padding: 0;
  }
}

@keyframes reply {
  0%,
  40% {
    opacity: 0;
    translate: 0 20%;
  }

  50%,
  88% {
    opacity: 1;
    translate: 0 0;
  }

  96%,
  100% {
    opacity: 0;
  }
}

@keyframes dot {
  50% {
    translate: 0 -60%;
    opacity: 0.4;
  }
}

@include reduced-motion {
  .window,
  .wisp,
  .enemy,
  .is-user,
  .is-typing,
  .is-typing b,
  .is-ai {
    animation: none;
  }

  .is-typing {
    display: none;
  }
}
</style>
