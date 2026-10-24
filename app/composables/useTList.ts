/** Resolves an array message (e.g. `"tags": ["A", "B"]`) to plain strings for the active locale. */
export function useTList() {
  const { tm, rt } = useI18n()

  return (key: string): string[] => {
    const messages = tm(key)
    return Array.isArray(messages) ? messages.map(message => rt(message)) : []
  }
}
