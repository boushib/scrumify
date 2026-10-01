export type IssueType = "story" | "task" | "bug" | "epic"
export type Priority = "highest" | "high" | "medium" | "low" | "lowest"
export type StatusCategory = "todo" | "in_progress" | "done"

export interface Status {
  id: string
  name: string
  category: StatusCategory
  /** Soft limit shown on the board column (0 = none) */
  wipLimit: number
}

export interface User {
  id: string
  name: string
  email: string
  title: string
  /** Hex color for the initials avatar */
  color: string
}

export interface Comment {
  id: string
  authorId: string
  body: string
  createdAt: number
  editedAt?: number
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export type ActivityKind =
  | "created"
  | "status"
  | "assignee"
  | "priority"
  | "points"
  | "sprint"
  | "type"
  | "title"
  | "description"
  | "labels"
  | "epic"
  | "comment"

export interface Activity {
  id: string
  actorId: string
  at: number
  kind: ActivityKind
  from?: string | number | null
  to?: string | number | null
}

export interface Issue {
  /** Human key like SCR-12, also the id */
  id: string
  projectId: string
  type: IssueType
  title: string
  description: string
  statusId: string
  priority: Priority
  points: number | null
  assigneeId: string | null
  reporterId: string
  labels: string[]
  epicId: string | null
  /** null = backlog */
  sprintId: string | null
  /** Ordering within a column / backlog list (lower first) */
  rank: number
  checklist: ChecklistItem[]
  comments: Comment[]
  activity: Activity[]
  createdAt: number
  updatedAt: number
  dueDate: number | null
}

export type SprintState = "planned" | "active" | "completed"

export interface Sprint {
  id: string
  projectId: string
  name: string
  goal: string
  state: SprintState
  startDate: number | null
  endDate: number | null
  completedAt: number | null
}

export interface Project {
  id: string
  key: string
  name: string
  description: string
  /** Emoji shown as the project avatar */
  icon: string
  color: string
  leadId: string
  statuses: Status[]
  nextIssueNumber: number
  createdAt: number
}
