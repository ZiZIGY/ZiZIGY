/*
 * Hydrate in the language the HTML was rendered in, then switch.
 *
 * A page can be rendered in one language and opened in another: the static build (GitHub Pages) is
 * always English, and on a server the request may be detected differently from the browser. With the
 * `no_prefix` strategy @nuxtjs/i18n picks the browser's language on the client before hydration, so
 * Vue hydrated English HTML with Russian data and left everything it doesn't patch while hydrating
 * (textContent / v-text, attributes) in English: the split headings, aria labels, cursor labels.
 * Here the client first takes back the language the HTML was rendered in, hydrates cleanly, and only
 * then switches, as an ordinary reactive update that reaches all of it. (The module does the same
 * for prefixed strategies in its ssg-detect plugin; for no_prefix that plugin stays off.)
 */
export default defineNuxtPlugin({
  name: 'locale-hydration',
  dependsOn: ['i18n:plugin:route-locale-detect'],
  async setup(nuxtApp) {
    const i18n = nuxtApp.$i18n
    // set while rendering on the server (or prerendering), read back from the payload on the client
    const rendered = useState('locale-hydration:rendered', () => i18n.locale.value)
    if (import.meta.server) return

    const wanted = i18n.locale.value
    if (rendered.value === wanted) return

    // not setLocale: that would also overwrite the remembered choice in the cookie
    await i18n.loadLocaleMessages(rendered.value)
    i18n.locale.value = rendered.value
    nuxtApp.hooks.hookOnce('app:suspense:resolve', () => i18n.setLocale(wanted))
  },
})
