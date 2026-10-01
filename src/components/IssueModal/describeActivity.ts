import { ISSUE_TYPES } from "@/components/ui/IssueTypeIcon"
import { PRIORITIES } from "@/components/ui/PriorityIcon"
import type { Activity, Issue, Project, Sprint, User } from "@/models"

interface Context {
  project: Project
  users: User[]
  sprints: Sprint[]
  issues: Record<string, Issue>
}

export interface ActivityText {
  /** "changed the Status" */
  action: string
  from?: string
  to?: string
}

const FIELD: Partial<Record<Activity["kind"], string>> = {
  status: "Status",
  assignee: "Assignee",
  priority: "Priority",
  points: "Story points",
  sprint: "Sprint",
  type: "Issue type",
  title: "Summary",
  labels: "Labels",
  epic: "Epic",
}

/** Turn a stored activity entry into readable text for the history tab */
export const describeActivity = (a: Activity, ctx: Context): ActivityText => {
  if (a.kind === "created") return { action: "created the issue" }
  if (a.kind === "comment") return { action: "added a comment" }
  if (a.kind === "description") return { action: "updated the Description" }

  const value = (v: Activity["from"]): string => {
    if (v === null || v === undefined || v === "") return "None"
    switch (a.kind) {
      case "status":
        return ctx.project.statuses.find(s => s.id === v)?.name ?? String(v)
      case "assignee":
        return ctx.users.find(u => u.id === v)?.name ?? "Unknown"
      case "priority":
        return PRIORITIES.find(p => p.priority === v)?.label ?? String(v)
      case "type":
        return ISSUE_TYPES.find(t => t.type === v)?.label ?? String(v)
      case "sprint":
        return ctx.sprints.find(s => s.id === v)?.name ?? "Deleted sprint"
      case "epic":
        return ctx.issues[String(v)]?.title ?? String(v)
      default:
        return String(v)
    }
  }

  const none = (v: Activity["from"]) => v === null || v === undefined || v === ""
  const fallback = a.kind === "assignee" ? "Unassigned" : a.kind === "sprint" ? "Backlog" : undefined
  return {
    action: `changed the ${FIELD[a.kind] ?? a.kind}`,
    from: none(a.from) && fallback ? fallback : value(a.from),
    to: none(a.to) && fallback ? fallback : value(a.to),
  }
}
