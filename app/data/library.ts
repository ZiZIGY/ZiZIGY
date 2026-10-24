/** vue-dnd-kit, the open-source library on its case page. */
export const library = {
  name: 'vue-dnd-kit',
  repo: 'ZiZIGY/vue-dnd-kit',
  package: '@vue-dnd-kit/core',
} as const

export interface LibraryStats {
  /** when the numbers were taken, YYYY-MM */
  asOf: string
  /** GitHub stars */
  stars: number
  /** npm downloads of the core package since its first release */
  total: number
  /** npm downloads by full calendar month, from the first full month after the first release, oldest first */
  monthly: { month: string, downloads: number }[]
  /** versions published to npm */
  releases: number
  latest: { version: string, date: string }
  /** the first stable release of each major version (1.0.0, 2.0.0…), for the chart's markers */
  majors: { version: string, month: string }[]
  /** runtime dependencies of the latest version */
  dependencies: number
}

/** Its numbers, taken by hand from GitHub and npm; the page rounds the big ones. Update them now and then. */
export const libraryStats: LibraryStats = {
  asOf: '2026-10',
  stars: 257,
  total: 352376,
  monthly: [
    { month: '2025-04', downloads: 3773 },
    { month: '2025-05', downloads: 1232 },
    { month: '2025-06', downloads: 1339 },
    { month: '2025-07', downloads: 2560 },
    { month: '2025-08', downloads: 3110 },
    { month: '2025-09', downloads: 4504 },
    { month: '2025-10', downloads: 5952 },
    { month: '2025-11', downloads: 6305 },
    { month: '2025-12', downloads: 8453 },
    { month: '2026-01', downloads: 11906 },
    { month: '2026-02', downloads: 17685 },
    { month: '2026-03', downloads: 26963 },
    { month: '2026-04', downloads: 30388 },
    { month: '2026-05', downloads: 29965 },
    { month: '2026-06', downloads: 35021 },
    { month: '2026-07', downloads: 43713 },
    { month: '2026-08', downloads: 51552 },
    { month: '2026-09', downloads: 41009 },
  ],
  releases: 124,
  latest: { version: '2.4.7', date: '2026-07-14' },
  majors: [
    { version: '1.0.0', month: '2025-04' },
    { version: '2.0.0', month: '2026-03' },
  ],
  dependencies: 0,
}
