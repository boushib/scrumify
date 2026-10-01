"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { createSeed, CURRENT_USER_ID, defaultStatuses } from "@/data/seed"
import { uid } from "@/lib/id"
import { rankBetween } from "@/lib/rank"
import type { Activity, ActivityKind, Comment, Issue, IssueType, Priority, Project, Sprint, User } from "@/models"

export type Theme = "dark" | "light"

export interface Toast {
  id: string
  message: string
  tone: "info" | "success" | "danger"
}

interface Data {
  users: User[]
  projects: Project[]
  sprints: Sprint[]
  issues: Record<string, Issue>
  theme: Theme
}

export interface NewIssue {
  projectId: string
  type: IssueType
  title: string
  description?: string
  statusId?: string
  priority?: Priority
  points?: number | null
  assigneeId?: string | null
  labels?: string[]
  epicId?: string | null
  sprintId?: string | null
}

type IssuePatch = Partial<
  Pick<
    Issue,
    | "title"
    | "description"
    | "type"
    | "statusId"
    | "priority"
    | "points"
    | "assigneeId"
    | "labels"
    | "epicId"
    | "sprintId"
    | "dueDate"
  >
>

interface Actions {
  // issues
  createIssue: (input: NewIssue) => Issue
  updateIssue: (id: string, patch: IssuePatch) => void
  deleteIssue: (id: string) => void
  /** Put a deleted issue back (undo) */
  restoreIssue: (issue: Issue) => void
  /** Move to a board column, placed between two neighbours */
  moveIssue: (id: string, statusId: string, beforeId?: string, afterId?: string) => void
  /** Move into a sprint (or the backlog with null), placed between two neighbours */
  planIssue: (id: string, sprintId: string | null, beforeId?: string, afterId?: string) => void
  addComment: (issueId: string, body: string) => void
  editComment: (issueId: string, commentId: string, body: string) => void
  deleteComment: (issueId: string, commentId: string) => void
  addChecklistItem: (issueId: string, text: string) => void
  toggleChecklistItem: (issueId: string, itemId: string) => void
  removeChecklistItem: (issueId: string, itemId: string) => void
  // sprints
  createSprint: (projectId: string) => Sprint
  updateSprint: (id: string, patch: Partial<Pick<Sprint, "name" | "goal" | "startDate" | "endDate">>) => void
  startSprint: (id: string, startDate: number, endDate: number, goal: string) => void
  /** Complete a sprint; unfinished issues move to the given sprint or the backlog */
  completeSprint: (id: string, moveTo: string | null) => void
  deleteSprint: (id: string) => void
  // projects
  createProject: (input: Pick<Project, "name" | "key" | "icon" | "color" | "description">) => Project
  updateProject: (id: string, patch: Partial<Pick<Project, "name" | "description" | "icon" | "color" | "leadId" | "statuses">>) => void
  // app
  setTheme: (theme: Theme) => void
  resetDemo: () => void
}

const seedData = (): Data => {
  const { users, projects, sprints, issues } = createSeed()
  return { users, projects, sprints, issues: Object.fromEntries(issues.map(i => [i.id, i])), theme: "dark" }
}

const activity = (kind: ActivityKind, from?: Activity["from"], to?: Activity["to"]): Activity => ({
  id: uid("a-"),
  actorId: CURRENT_USER_ID,
  at: Date.now(),
  kind,
  from,
  to,
})

const TRACKED: (keyof IssuePatch)[] = ["statusId", "assigneeId", "priority", "points", "sprintId", "type", "title", "description", "labels", "epicId"]
const KIND: Partial<Record<keyof IssuePatch, ActivityKind>> = {
  statusId: "status",
  assigneeId: "assignee",
  priority: "priority",
  points: "points",
  sprintId: "sprint",
  type: "type",
  title: "title",
  description: "description",
  labels: "labels",
  epicId: "epic",
}

/** Apply a patch to an issue and log each changed field */
const applyPatch = (issue: Issue, patch: IssuePatch): Issue => {
  const log: Activity[] = []
  for (const key of TRACKED) {
    if (!(key in patch)) continue
    const before = issue[key]
    const after = patch[key]
    if (JSON.stringify(before) === JSON.stringify(after)) continue
    const kind = KIND[key]!
    // Long text changes are logged without their contents
    const simple = (v: unknown) => (Array.isArray(v) ? v.join(", ") : (v as string | number | null))
    log.push(kind === "description" ? activity(kind) : activity(kind, simple(before), simple(after)))
  }
  if (!log.length && !("dueDate" in patch)) return issue
  return { ...issue, ...patch, activity: [...issue.activity, ...log], updatedAt: Date.now() }
}

export const useStore = create<Data & Actions>()(
  persist(
    (set, get) => {
      const patchIssue = (id: string, fn: (issue: Issue) => Issue) =>
        set(state => (state.issues[id] ? { issues: { ...state.issues, [id]: fn(state.issues[id]) } } : state))

      return {
        ...seedData(),

        createIssue: input => {
          const project = get().projects.find(p => p.id === input.projectId)!
          const now = Date.now()
          const siblings = Object.values(get().issues).filter(
            i => i.projectId === input.projectId && i.sprintId === (input.sprintId ?? null)
          )
          const issue: Issue = {
            id: `${project.key}-${project.nextIssueNumber}`,
            projectId: input.projectId,
            type: input.type,
            title: input.title.trim(),
            description: input.description ?? "",
            statusId: input.statusId ?? project.statuses[0].id,
            priority: input.priority ?? "medium",
            points: input.points ?? null,
            assigneeId: input.assigneeId ?? null,
            reporterId: CURRENT_USER_ID,
            labels: input.labels ?? [],
            epicId: input.epicId ?? null,
            sprintId: input.sprintId ?? null,
            rank: Math.max(0, ...siblings.map(i => i.rank)) + 1000,
            checklist: [],
            comments: [],
            activity: [{ id: uid("a-"), actorId: CURRENT_USER_ID, at: now, kind: "created" }],
            createdAt: now,
            updatedAt: now,
            dueDate: null,
          }
          set(state => ({
            issues: { ...state.issues, [issue.id]: issue },
            projects: state.projects.map(p =>
              p.id === project.id ? { ...p, nextIssueNumber: p.nextIssueNumber + 1 } : p
            ),
          }))
          return issue
        },

        updateIssue: (id, patch) => patchIssue(id, issue => applyPatch(issue, patch)),

        deleteIssue: id =>
          set(state => {
            const issues = { ...state.issues }
            delete issues[id]
            // Children of a deleted epic lose their epic link
            for (const issue of Object.values(issues)) {
              if (issue.epicId === id) issues[issue.id] = { ...issue, epicId: null }
            }
            return { issues }
          }),

        restoreIssue: issue => set(state => ({ issues: { ...state.issues, [issue.id]: issue } })),

        moveIssue: (id, statusId, beforeId, afterId) => {
          const { issues } = get()
          // Without neighbours (status picked from a menu) the issue keeps its place
          const rank =
            beforeId || afterId
              ? rankBetween(beforeId ? issues[beforeId]?.rank : undefined, afterId ? issues[afterId]?.rank : undefined)
              : (issues[id]?.rank ?? 0)
          patchIssue(id, issue => ({ ...applyPatch(issue, { statusId }), rank, updatedAt: Date.now() }))
        },

        planIssue: (id, sprintId, beforeId, afterId) => {
          const { issues } = get()
          const issue = issues[id]
          if (!issue) return
          // Without neighbours (sprint picked from a menu) the issue goes to the end
          const last = Math.max(
            0,
            ...Object.values(issues)
              .filter(i => i.projectId === issue.projectId && i.sprintId === sprintId && i.id !== id)
              .map(i => i.rank)
          )
          const rank =
            beforeId || afterId
              ? rankBetween(beforeId ? issues[beforeId]?.rank : undefined, afterId ? issues[afterId]?.rank : undefined)
              : last + 1000
          patchIssue(id, issue => ({ ...applyPatch(issue, { sprintId }), rank, updatedAt: Date.now() }))
        },

        addComment: (issueId, body) =>
          patchIssue(issueId, issue => {
            const comment: Comment = { id: uid("c-"), authorId: CURRENT_USER_ID, body, createdAt: Date.now() }
            return {
              ...issue,
              comments: [...issue.comments, comment],
              activity: [...issue.activity, activity("comment")],
              updatedAt: Date.now(),
            }
          }),

        editComment: (issueId, commentId, body) =>
          patchIssue(issueId, issue => ({
            ...issue,
            comments: issue.comments.map(c => (c.id === commentId ? { ...c, body, editedAt: Date.now() } : c)),
          })),

        deleteComment: (issueId, commentId) =>
          patchIssue(issueId, issue => ({ ...issue, comments: issue.comments.filter(c => c.id !== commentId) })),

        addChecklistItem: (issueId, text) =>
          patchIssue(issueId, issue => ({
            ...issue,
            checklist: [...issue.checklist, { id: uid("k-"), text, done: false }],
            updatedAt: Date.now(),
          })),

        toggleChecklistItem: (issueId, itemId) =>
          patchIssue(issueId, issue => ({
            ...issue,
            checklist: issue.checklist.map(k => (k.id === itemId ? { ...k, done: !k.done } : k)),
            updatedAt: Date.now(),
          })),

        removeChecklistItem: (issueId, itemId) =>
          patchIssue(issueId, issue => ({ ...issue, checklist: issue.checklist.filter(k => k.id !== itemId) })),

        createSprint: projectId => {
          const project = get().projects.find(p => p.id === projectId)!
          const count = get().sprints.filter(s => s.projectId === projectId).length
          const sprint: Sprint = {
            id: uid("s-"),
            projectId,
            name: `${project.key} Sprint ${count + 1}`,
            goal: "",
            state: "planned",
            startDate: null,
            endDate: null,
            completedAt: null,
          }
          set(state => ({ sprints: [...state.sprints, sprint] }))
          return sprint
        },

        updateSprint: (id, patch) =>
          set(state => ({ sprints: state.sprints.map(s => (s.id === id ? { ...s, ...patch } : s)) })),

        startSprint: (id, startDate, endDate, goal) =>
          set(state => ({
            sprints: state.sprints.map(s => (s.id === id ? { ...s, state: "active", startDate, endDate, goal } : s)),
          })),

        completeSprint: (id, moveTo) =>
          set(state => {
            const sprint = state.sprints.find(s => s.id === id)
            if (!sprint) return state
            const project = state.projects.find(p => p.id === sprint.projectId)!
            const doneIds = new Set(project.statuses.filter(s => s.category === "done").map(s => s.id))
            const issues = { ...state.issues }
            for (const issue of Object.values(issues)) {
              if (issue.sprintId === id && !doneIds.has(issue.statusId)) {
                issues[issue.id] = applyPatch(issue, { sprintId: moveTo })
              }
            }
            return {
              issues,
              sprints: state.sprints.map(s => (s.id === id ? { ...s, state: "completed", completedAt: Date.now() } : s)),
            }
          }),

        deleteSprint: id =>
          set(state => {
            const issues = { ...state.issues }
            for (const issue of Object.values(issues)) {
              if (issue.sprintId === id) issues[issue.id] = applyPatch(issue, { sprintId: null })
            }
            return { issues, sprints: state.sprints.filter(s => s.id !== id) }
          }),

        createProject: input => {
          const project: Project = {
            id: uid("p-"),
            key: input.key.toUpperCase(),
            name: input.name.trim(),
            description: input.description,
            icon: input.icon,
            color: input.color,
            leadId: CURRENT_USER_ID,
            statuses: defaultStatuses(),
            nextIssueNumber: 1,
            createdAt: Date.now(),
          }
          set(state => ({ projects: [...state.projects, project] }))
          return project
        },

        updateProject: (id, patch) =>
          set(state => ({ projects: state.projects.map(p => (p.id === id ? { ...p, ...patch } : p)) })),

        setTheme: theme => set({ theme }),

        resetDemo: () => set(seedData()),
      }
    },
    {
      name: "scrumify:v2",
      storage: createJSONStorage(() => localStorage),
      // Persist data only; actions are recreated
      partialize: ({ users, projects, sprints, issues, theme }) => ({ users, projects, sprints, issues, theme }),
    }
  )
)

export { CURRENT_USER_ID }
