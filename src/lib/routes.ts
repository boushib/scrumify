/** A project's pages. The project lives in the query (/board?project=SCR) so every page is one static file */
export type ProjectView = "board" | "backlog" | "reports" | "settings"

export const projectHref = (key: string, view: ProjectView = "board", extra?: Record<string, string>) =>
  `/${view}?${new URLSearchParams({ project: key, ...extra })}`
