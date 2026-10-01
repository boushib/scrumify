import type { Issue, Project, Sprint, StatusCategory } from "@/models"

const DAY = 24 * 60 * 60 * 1000

const startOfDay = (ts: number) => {
  const d = new Date(ts)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** The issue's status at a point in time, replayed from its activity log */
export const statusAt = (issue: Issue, at: number) => {
  const moves = issue.activity.filter(a => a.kind === "status")
  const before = moves.filter(a => a.at <= at)
  if (before.length) return String(before[before.length - 1].to)
  // No move yet: it was in the status the first later move came from
  const after = moves.find(a => a.at > at)
  return after ? String(after.from) : issue.statusId
}

const categoryOf = (project: Project, statusId: string): StatusCategory =>
  project.statuses.find(s => s.id === statusId)?.category ?? "todo"

export interface BurndownPoint {
  day: number
  /** Remaining points at the end of the day; null for days still ahead */
  remaining: number | null
  ideal: number
}

/** Remaining story points per day of a sprint, with the ideal straight line */
export const burndown = (project: Project, sprint: Sprint, issues: Issue[], now: number): BurndownPoint[] => {
  if (!sprint.startDate || !sprint.endDate) return []
  const first = startOfDay(sprint.startDate)
  const last = startOfDay(sprint.endDate)
  const days = Math.max(1, Math.round((last - first) / DAY))
  const inSprint = issues.filter(i => i.sprintId === sprint.id)
  const remainingAt = (at: number) =>
    inSprint
      .filter(i => i.createdAt <= at && categoryOf(project, statusAt(i, at)) !== "done")
      .reduce((sum, i) => sum + (i.points ?? 0), 0)
  const scope = remainingAt(first + DAY - 1)

  return Array.from({ length: days + 1 }, (_, n) => {
    const day = first + n * DAY
    const end = day + DAY - 1
    return {
      day,
      remaining: day > now ? null : remainingAt(Math.min(end, now)),
      ideal: Math.round((scope * (1 - n / days)) * 10) / 10,
    }
  })
}

export interface VelocityPoint {
  sprint: Sprint
  committed: number
  completed: number
}

/** Committed vs completed points for completed sprints (and the active one so far) */
export const velocity = (project: Project, sprints: Sprint[], issues: Issue[]): VelocityPoint[] =>
  sprints
    .filter(s => s.projectId === project.id && s.state !== "planned")
    .sort((a, b) => (a.startDate ?? 0) - (b.startDate ?? 0))
    .slice(-6)
    .map(sprint => {
      const stayed = issues.filter(i => i.sprintId === sprint.id)
      // Issues moved out of the sprint (e.g. unfinished at completion) still count as committed
      const movedOut = issues.filter(
        i => i.sprintId !== sprint.id && i.activity.some(a => a.kind === "sprint" && a.from === sprint.id)
      )
      const points = (list: Issue[]) => list.reduce((sum, i) => sum + (i.points ?? 0), 0)
      return {
        sprint,
        committed: points(stayed) + points(movedOut),
        completed: points(stayed.filter(i => categoryOf(project, i.statusId) === "done")),
      }
    })

export interface Slice {
  key: string
  label: string
  value: number
}

/** Issue counts per status */
export const statusBreakdown = (project: Project, issues: Issue[]): Slice[] =>
  project.statuses.map(s => ({ key: s.id, label: s.name, value: issues.filter(i => i.statusId === s.id).length }))

export interface Workload {
  userId: string | null
  todo: number
  in_progress: number
  done: number
}

/** Story points per assignee, split by status category */
export const workload = (project: Project, issues: Issue[]): Workload[] => {
  const map = new Map<string | null, Workload>()
  for (const issue of issues) {
    const row = map.get(issue.assigneeId) ?? { userId: issue.assigneeId, todo: 0, in_progress: 0, done: 0 }
    row[categoryOf(project, issue.statusId)] += issue.points ?? 0
    map.set(issue.assigneeId, row)
  }
  return [...map.values()].sort((a, b) => b.todo + b.in_progress + b.done - (a.todo + a.in_progress + a.done))
}
