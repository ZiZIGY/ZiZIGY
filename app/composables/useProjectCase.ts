import { findProject, nextProject } from '~/data/projects'

/**
 * The data every case page starts from: the project, the one after it, a key helper for its copy, and
 * the page's SEO. Each project has its own page (pages/projects/<slug>.vue), so a page is free to add
 * its own sections between the shared case blocks (components/project/case).
 */
export function useProjectCase(slug: string) {
  const { t } = useI18n()

  const project = findProject(slug)
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
  const next = nextProject(slug)

  const key = (field: string) => `projects.items.${slug}.${field}`

  useSeoMeta({
    title: () => t(key('title')),
    description: () => t(key('summary')),
  })

  return { project, next, key }
}
