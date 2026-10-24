<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { gsap } from 'gsap'
import { education } from '~/data/experience'
import { site } from '~/data/site'

const { t } = useI18n()
const { copy, copied } = useClipboard({ source: site.email, copiedDuring: 2000 })

const needs = ['site', 'app', 'motion', 'team'] as const
const starts = ['now', 'month', 'later'] as const
const need = ref<(typeof needs)[number]>('app')
const start = ref<(typeof starts)[number]>('month')

const message = computed(() => t('contact.builder.message', {
  what: t(`contact.builder.needs.${need.value}.phrase`),
  when: t(`contact.builder.starts.${start.value}.phrase`),
}))
const telegram = site.socials.find(social => social.name === 'Telegram')!.href
const telegramHref = computed(() => `${telegram}?text=${encodeURIComponent(message.value)}`)
const mailHref = computed(() => {
  const subject = t('contact.builder.subject', { what: t(`contact.builder.needs.${need.value}.label`) })
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message.value)}`
})

const [emailName, emailHost] = site.email.split('@')

const links = computed(() => [
  { id: 'telegram', href: telegram, value: `@${telegram.split('/').pop()}` },
  { id: 'github', href: site.github, value: 'ZiZIGY · vue-dnd-kit' },
  { id: 'habr', href: site.articles, value: t('contact.habrValue') },
  { id: 'resume', href: withBase(site.resume), value: 'PDF' },
])

const root = useTemplateRef<HTMLElement>('root')
const card = useTemplateRef<HTMLElement>('card')

useSectionSpy(card, 'contact')

useGsap(({ reduceMotion }) => {
  const el = card.value
  if (!el || reduceMotion) return

  gsap.fromTo(el, { y: 90 }, {
    y: 0,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: true },
  })

  gsap.from('.reach-row, .chip', {
    y: 24,
    opacity: 0,
    duration: 0.9,
    ease: 'expo.out',
    stagger: 0.035,
    scrollTrigger: { trigger: '.contact-grid', start: 'top 80%', once: true },
  })
}, root)
</script>

<template>
  <section
    id="contact"
    ref="root"
    v-pause-offscreen
    class="py-[clamp(3rem,6vw,6rem)]"
  >
    <div class="container-site">
      <div
        ref="card"
        class="contact-card grain relative overflow-hidden rounded-[2.5rem] bg-ink px-[clamp(1.25rem,5vw,6rem)] py-[clamp(2.5rem,7vw,7rem)] text-paper dark:ring-1 dark:ring-white/10 dark:ring-inset"
      >
        <div class="contact-grid grid gap-x-(--col-gap) gap-y-12 lg:grid-cols-12 lg:gap-y-[clamp(3.5rem,6vw,5rem)]">
          <h2 class="type-h2 max-w-[12ch] lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <FxReveal
              as="span"
              class="block"
              :text="t('contact.line1')"
              by="chars"
            />
            <FxReveal
              as="span"
              class="block"
              :text="t('contact.line2')"
              by="chars"
              :delay="0.15"
            />
            <FxReveal
              as="span"
              class="block text-signal"
              :text="t('contact.line3')"
              by="chars"
              :delay="0.3"
            />
          </h2>

          <div class="builder lg:col-span-12 lg:row-start-2">
            <div class="builder-choices">
              <div class="builder-group">
                <p
                  id="contact-need"
                  class="builder-label"
                >
                  {{ t('contact.builder.need') }}
                </p>
                <div
                  class="chips"
                  role="radiogroup"
                  aria-labelledby="contact-need"
                >
                  <button
                    v-for="id in needs"
                    :key="id"
                    type="button"
                    role="radio"
                    class="chip"
                    :aria-checked="need === id"
                    @click="need = id"
                  >
                    {{ t(`contact.builder.needs.${id}.label`) }}
                  </button>
                </div>
              </div>
              <div class="builder-group">
                <p
                  id="contact-start"
                  class="builder-label"
                >
                  {{ t('contact.builder.start') }}
                </p>
                <div
                  class="chips"
                  role="radiogroup"
                  aria-labelledby="contact-start"
                >
                  <button
                    v-for="id in starts"
                    :key="id"
                    type="button"
                    role="radio"
                    class="chip"
                    :aria-checked="start === id"
                    @click="start = id"
                  >
                    {{ t(`contact.builder.starts.${id}.label`) }}
                  </button>
                </div>
              </div>
            </div>

            <div class="builder-preview">
              <p class="builder-label">
                {{ t('contact.builder.preview') }}
              </p>
              <i18n-t
                keypath="contact.builder.message"
                tag="p"
                scope="global"
                class="builder-message"
                aria-live="polite"
              >
                <template #what>
                  <Transition
                    name="word"
                    mode="out-in"
                  >
                    <mark
                      :key="need"
                      class="builder-word"
                    >{{ t(`contact.builder.needs.${need}.phrase`) }}</mark>
                  </Transition>
                </template>
                <template #when>
                  <Transition
                    name="word"
                    mode="out-in"
                  >
                    <mark
                      :key="start"
                      class="builder-word"
                    >{{ t(`contact.builder.starts.${start}.phrase`) }}</mark>
                  </Transition>
                </template>
              </i18n-t>
              <div class="mt-auto flex flex-wrap gap-3 pt-8">
                <FxMagnetic>
                  <Button
                    as="a"
                    :href="telegramHref"
                    target="_blank"
                    rel="noopener"
                    variant="signal"
                    size="pill-lg"
                    class="font-semibold"
                  >
                    {{ t('contact.builder.telegram') }}
                    <FxArrow />
                  </Button>
                </FxMagnetic>
                <Button
                  as="a"
                  :href="mailHref"
                  variant="glass"
                  size="pill-lg"
                  class="glass-on-dark font-semibold"
                >
                  {{ t('contact.builder.mail') }}
                </Button>
              </div>
            </div>
          </div>

          <!-- the ways to reach me, beside the headline -->
          <div class="max-lg:order-last lg:col-span-5 lg:col-start-8 lg:row-start-1">
            <div class="flex items-center justify-between gap-4">
              <a
                :href="`mailto:${site.email}`"
                class="contact-email"
              >{{ emailName }}@<wbr>{{ emailHost }}</a>
              <button
                type="button"
                class="copy-button"
                data-cursor="copy"
                :aria-label="copied ? t('contact.copied') : t('contact.copy')"
                @click="copy()"
              >
                <Check
                  v-if="copied"
                  class="size-4 text-signal"
                />
                <Copy
                  v-else
                  class="size-4"
                />
              </button>
            </div>

            <ul class="mt-6">
              <li
                v-for="link in links"
                :key="link.id"
              >
                <a
                  class="reach-row is-link"
                  :href="link.href"
                  target="_blank"
                  rel="noopener"
                >
                  <span class="reach-label">{{ t(`contact.rows.${link.id}`) }}</span>
                  <span class="reach-value">{{ link.value }}</span>
                  <FxArrow class="reach-arrow size-3.5" />
                </a>
              </li>
              <li class="reach-row">
                <span class="reach-label">{{ t('contact.rows.education') }}</span>
                <span class="reach-value">{{ education.year }} · {{ t('contact.educationValue') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.builder {
  display: grid;
  gap: 2rem;
  padding: clamp(1.25rem, 2.6vw, 2.25rem);
  border-radius: 1.75rem;
  background: rgb(255 255 255 / 0.04);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1);

  @include up(lg) {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: var(--col-gap);
  }
}

.builder-group + .builder-group {
  margin-top: 1.75rem;
}

.builder-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(242 241 237 / 0.55);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
}

.chip {
  min-height: 2.75rem;
  padding-inline: 1.15rem;
  border-radius: 99px;
  background: rgb(255 255 255 / 0.06);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.12);
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgb(242 241 237 / 0.8);
  transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;

  &[aria-checked="true"] {
    background: var(--color-paper);
    color: var(--color-ink);
    box-shadow: none;
  }

  @include hover {
    &:not([aria-checked="true"]) {
      background: rgb(255 255 255 / 0.12);
    }
  }
}

.builder-preview {
  display: flex;
  flex-direction: column;
  padding: clamp(1.25rem, 2.2vw, 1.75rem);
  border-radius: 1.25rem;
  background: rgb(255 255 255 / 0.05);
}

.builder-message {
  margin-top: 0.75rem;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2.4vw, 2.25rem);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.025em;

  &::after {
    content: "";
    display: inline-block;
    width: 3px;
    height: 0.95em;
    margin-left: 0.12em;
    vertical-align: -0.12em;
    background: var(--color-signal);
    animation: caret-blink 1s steps(1) infinite;
  }
}

.builder-word {
  background: none;
  color: var(--color-paper);
  text-decoration: underline;
  text-decoration-color: var(--color-signal);
  text-decoration-thickness: 0.09em;
  text-underline-offset: 0.16em;
}

.word-enter-active,
.word-leave-active {
  transition: opacity 0.2s;
}

.word-enter-from,
.word-leave-to {
  opacity: 0;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

.contact-email {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2vw, 2rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.03em;
  background: linear-gradient(currentColor, currentColor) no-repeat 0 100% / 100% 2px;
  padding-bottom: 0.08em;
  transition: background-size 0.6s var(--ease-out-expo);

  @include hover {
    background-size: 0% 2px;
    background-position: 100% 100%;
  }
}

.copy-button {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.06);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.12);
  transition: background-color 0.3s;

  @include hover {
    background: rgb(255 255 255 / 0.12);
  }
}

.reach-row {
  position: relative;
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0.75rem;
  margin-inline: -0.75rem;
  border-radius: 1rem;
  transition: background-color 0.3s;

  @include up(sm) {
    grid-template-columns: 6.5rem minmax(0, 1fr) auto;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    inset-inline: 0.75rem;
    height: 1px;
    border-radius: 1px;
    background: rgb(255 255 255 / 0.1);
  }

  &.is-link {
    @include hover {
      background: rgb(255 255 255 / 0.06);

      .reach-arrow {
        translate: 0.2rem -0.2rem;
        color: var(--color-signal);
      }
    }
  }
}

.reach-label {
  font-size: 0.8125rem;
  color: rgb(242 241 237 / 0.55);
}

.reach-value {
  font-size: 0.9375rem;
  font-weight: 600;
}

.reach-arrow {
  transition: translate 0.5s var(--ease-out-expo), color 0.3s;
}

@include reduced-motion {
  .builder-message::after {
    animation: none;
  }
}
</style>
