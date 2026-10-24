/** A file from public/ or a plain link, under the site's base URL (on GitHub Pages the site lives in /ZiZIGY/). */
export function withBase(path: string) {
  return `${useRuntimeConfig().app.baseURL.replace(/\/$/, '')}${path}`
}
