import type { Issue, Project, Sprint, Status } from "@/models"

export const projectByKey = (projects: Project[], key: string) =>
  projects.find(p => p.key.toLowerCase() === key.toLowerCase())

export const activeSprintOf = (sprints: Sprint[], projectId: string) =>
  sprints.find(s => s.projectId === projectId && s.state === "active")

export const issuesOf = (issues: Record<string, Issue>, projectId: string) =>
  Object.values(issues).filter(i => i.projectId === projectId)

export const byRank = (a: Issue, b: Issue) => a.rank - b.rank

export const statusById = (project: Project, id: string): Status =>
  project.statuses.find(s => s.id === id) ?? project.statuses[0]

export const isDone = (project: Project, issue: Issue) => statusById(project, issue.statusId).category === "done"

export const sumPoints = (issues: Issue[]) => issues.reduce((sum, i) => sum + (i.points ?? 0), 0)
