import type { Locale } from 'vue-i18n'

/** Locale switching wrapped in a view transition; the choice is remembered in the i18n cookie. */
export function useLocaleSwitch() {
  const { locale, locales, setLocale } = useI18n()
  const { run } = useViewTransition()

  const otherLocales = computed(() => locales.value.filter(item => item.code !== locale.value))

  async function switchTo(code: Locale) {
    if (code === locale.value) return
    await run(() => setLocale(code), { types: ['locale'] })
  }

  return { locale, locales, otherLocales, switchTo }
}
