import type {
  Activity,
  ChecklistItem,
  Comment,
  Issue,
  IssueType,
  Priority,
  Project,
  Sprint,
  Status,
  User,
} from "@/models"

const DAY = 24 * 60 * 60 * 1000

export const CURRENT_USER_ID = "u-me"

export const USERS: User[] = [
  { id: "u-me", name: "El Hassane Boushib", email: "elhassane@scrumify.dev", title: "Engineering Lead", color: "#ff7a51" },
  { id: "u-sarah", name: "Sarah Chen", email: "sarah@scrumify.dev", title: "Product Manager", color: "#a855f7" },
  { id: "u-kai", name: "Kai Nakamura", email: "kai@scrumify.dev", title: "Frontend Engineer", color: "#3b82f6" },
  { id: "u-omar", name: "Omar Haddad", email: "omar@scrumify.dev", title: "Backend Engineer", color: "#10b981" },
  { id: "u-ava", name: "Ava Martins", email: "ava@scrumify.dev", title: "Product Designer", color: "#ec4899" },
  { id: "u-leo", name: "Leo Fischer", email: "leo@scrumify.dev", title: "QA Engineer", color: "#f59e0b" },
]

export const defaultStatuses = (): Status[] => [
  { id: "todo", name: "To Do", category: "todo", wipLimit: 0 },
  { id: "in_progress", name: "In Progress", category: "in_progress", wipLimit: 4 },
  { id: "in_review", name: "In Review", category: "in_progress", wipLimit: 3 },
  { id: "done", name: "Done", category: "done", wipLimit: 0 },
]

interface SeedIssue {
  n: number
  type: IssueType
  title: string
  description?: string
  status?: string
  priority?: Priority
  points?: number | null
  assignee?: string | null
  reporter?: string
  labels?: string[]
  epic?: number
  sprint?: string | null
  created: number
  /** [statusId, daysAgo] transitions after creation */
  moves?: [string, number][]
  checklist?: [string, boolean][]
  comments?: [string, string, number][]
  due?: number
}

const build = (now: number, projectId: string, key: string, seeds: SeedIssue[]): Issue[] =>
  seeds.map((s, index) => {
    const createdAt = now - s.created * DAY
    const reporter = s.reporter ?? "u-sarah"
    const activity: Activity[] = [{ id: `${key}-${s.n}-a0`, actorId: reporter, at: createdAt, kind: "created" }]
    let previous = "todo"
    s.moves?.forEach(([to, daysAgo], i) => {
      activity.push({
        id: `${key}-${s.n}-a${i + 1}`,
        actorId: s.assignee ?? reporter,
        at: now - daysAgo * DAY,
        kind: "status",
        from: previous,
        to,
      })
      previous = to
    })
    const comments: Comment[] = (s.comments ?? []).map(([authorId, body, daysAgo], i) => ({
      id: `${key}-${s.n}-c${i}`,
      authorId,
      body,
      createdAt: now - daysAgo * DAY,
    }))
    const checklist: ChecklistItem[] = (s.checklist ?? []).map(([text, done], i) => ({
      id: `${key}-${s.n}-k${i}`,
      text,
      done,
    }))
    const updatedAt = Math.max(createdAt, ...activity.map(a => a.at), ...comments.map(c => c.createdAt))
    return {
      id: `${key}-${s.n}`,
      projectId,
      type: s.type,
      title: s.title,
      description: s.description ?? "",
      statusId: s.status ?? previous,
      priority: s.priority ?? "medium",
      points: s.points === undefined ? (s.type === "epic" ? null : 3) : s.points,
      assigneeId: s.assignee === undefined ? null : s.assignee,
      reporterId: reporter,
      labels: s.labels ?? [],
      epicId: s.epic ? `${key}-${s.epic}` : null,
      sprintId: s.sprint ?? null,
      rank: (index + 1) * 1000,
      checklist,
      comments,
      activity,
      createdAt,
      updatedAt,
      dueDate: s.due !== undefined ? now + s.due * DAY : null,
    }
  })

export const createSeed = (now = Date.now()) => {
  const projects: Project[] = [
    {
      id: "p-scr",
      key: "SCR",
      name: "Scrumify",
      description: "Agile project management for small teams.",
      icon: "🚀",
      color: "#ff7a51",
      leadId: CURRENT_USER_ID,
      statuses: defaultStatuses(),
      nextIssueNumber: 34,
      createdAt: now - 60 * DAY,
    },
    {
      id: "p-mob",
      key: "MOB",
      name: "Mobile App",
      description: "iOS and Android companion app.",
      icon: "📱",
      color: "#3b82f6",
      leadId: "u-kai",
      statuses: defaultStatuses(),
      nextIssueNumber: 7,
      createdAt: now - 20 * DAY,
    },
  ]

  const sprints: Sprint[] = [
    { id: "s-scr-1", projectId: "p-scr", name: "SCR Sprint 1", goal: "Sign in and basic board", state: "completed", startDate: now - 34 * DAY, endDate: now - 20 * DAY, completedAt: now - 20 * DAY },
    { id: "s-scr-2", projectId: "p-scr", name: "SCR Sprint 2", goal: "Drag and drop + issue details", state: "completed", startDate: now - 20 * DAY, endDate: now - 6 * DAY, completedAt: now - 6 * DAY },
    { id: "s-scr-3", projectId: "p-scr", name: "SCR Sprint 3", goal: "Backlog planning and the first reports", state: "active", startDate: now - 6 * DAY, endDate: now + 8 * DAY, completedAt: null },
    { id: "s-scr-4", projectId: "p-scr", name: "SCR Sprint 4", goal: "", state: "planned", startDate: null, endDate: null, completedAt: null },
    { id: "s-mob-1", projectId: "p-mob", name: "MOB Sprint 1", goal: "App shell and auth", state: "active", startDate: now - 3 * DAY, endDate: now + 11 * DAY, completedAt: null },
  ]

  const scr: SeedIssue[] = [
    // Epics
    { n: 1, type: "epic", title: "Authentication & accounts", description: "Sign up, sign in, password reset and SSO.", status: "in_progress", priority: "high", created: 40, assignee: "u-omar", labels: ["auth"] },
    { n: 2, type: "epic", title: "Board & workflow", description: "Everything related to the scrum board and issue lifecycle.", status: "in_progress", priority: "highest", created: 40, assignee: "u-kai", labels: ["board"] },
    { n: 3, type: "epic", title: "Reporting", description: "Burndown, velocity and team insights.", status: "todo", priority: "medium", created: 30, assignee: "u-sarah", labels: ["reports"] },

    // Sprint 1 (completed)
    { n: 4, type: "story", title: "Email & password sign in", epic: 1, sprint: "s-scr-1", assignee: "u-omar", points: 5, priority: "high", created: 36, moves: [["in_progress", 33], ["in_review", 28], ["done", 27]], labels: ["auth", "backend"] },
    { n: 5, type: "story", title: "Create the scrum board layout", epic: 2, sprint: "s-scr-1", assignee: "u-kai", points: 5, created: 36, moves: [["in_progress", 32], ["done", 26]], labels: ["board", "frontend"] },
    { n: 6, type: "task", title: "Set up CI pipeline", sprint: "s-scr-1", assignee: "u-me", points: 2, created: 35, moves: [["in_progress", 34], ["done", 31]], labels: ["devops"] },
    { n: 7, type: "bug", title: "Login form submits twice on Enter", epic: 1, sprint: "s-scr-1", assignee: "u-leo", points: 1, priority: "high", created: 30, moves: [["in_progress", 25], ["done", 23]], labels: ["auth"] },
    { n: 8, type: "story", title: "Light and dark theme", sprint: "s-scr-1", assignee: "u-ava", points: 3, created: 34, moves: [["in_progress", 30], ["done", 22]], labels: ["design"] },

    // Sprint 2 (completed)
    { n: 9, type: "story", title: "Drag and drop issues between columns", epic: 2, sprint: "s-scr-2", assignee: "u-kai", points: 8, priority: "highest", created: 24, moves: [["in_progress", 19], ["in_review", 12], ["done", 10]], labels: ["board", "frontend"] },
    { n: 10, type: "story", title: "Issue details modal", epic: 2, sprint: "s-scr-2", assignee: "u-kai", points: 5, created: 24, moves: [["in_progress", 15], ["done", 9]], labels: ["frontend"] },
    { n: 11, type: "story", title: "Password reset via email", epic: 1, sprint: "s-scr-2", assignee: "u-omar", points: 5, created: 23, moves: [["in_progress", 18], ["done", 8]], labels: ["auth", "backend"] },
    { n: 12, type: "task", title: "Design system tokens", sprint: "s-scr-2", assignee: "u-ava", points: 3, created: 22, moves: [["in_progress", 19], ["done", 14]], labels: ["design"] },
    { n: 13, type: "bug", title: "Cards flicker when dropped on the same column", epic: 2, sprint: "s-scr-2", assignee: "u-leo", points: 2, created: 16, moves: [["in_progress", 12], ["done", 7]], labels: ["board"] },

    // Sprint 3 (active)
    {
      n: 14, type: "story", title: "Backlog view with sprint planning", epic: 2, sprint: "s-scr-3", assignee: "u-kai", points: 8, priority: "highest", created: 10,
      description: "As a product manager I want to drag issues from the backlog into sprints so that I can plan the next iteration.\n\n**Acceptance criteria**\n- Backlog and planned sprints are listed with point totals\n- Issues can be dragged between them\n- A sprint can be started and completed",
      moves: [["in_progress", 4]], labels: ["board", "frontend"],
      checklist: [["Sprint sections with totals", true], ["Drag between lists", true], ["Start sprint modal", false], ["Complete sprint modal", false]],
      comments: [["u-sarah", "Let's make sure unfinished issues can roll over to the next sprint when completing.", 3], ["u-kai", "Yep, the complete modal will ask where to move them.", 2]],
    },
    { n: 15, type: "story", title: "Sprint burndown chart", epic: 3, sprint: "s-scr-3", assignee: "u-sarah", points: 5, priority: "high", created: 9, moves: [["in_progress", 2]], labels: ["reports"], description: "Ideal vs. actual remaining story points for the active sprint." },
    { n: 16, type: "story", title: "Velocity report", epic: 3, sprint: "s-scr-3", assignee: "u-omar", points: 3, created: 9, labels: ["reports"] },
    { n: 17, type: "task", title: "Issue activity log", epic: 2, sprint: "s-scr-3", assignee: "u-omar", points: 3, created: 8, moves: [["in_progress", 5], ["in_review", 2]], labels: ["backend"] },
    { n: 18, type: "bug", title: "Avatar images fail to load offline", sprint: "s-scr-3", assignee: "u-leo", points: 1, priority: "low", created: 7, moves: [["in_progress", 5], ["done", 4]], labels: ["frontend"] },
    { n: 19, type: "story", title: "Comments on issues", epic: 2, sprint: "s-scr-3", assignee: "u-kai", points: 5, created: 7, moves: [["in_progress", 5], ["in_review", 3], ["done", 1]], labels: ["frontend"], comments: [["u-leo", "Tested on Safari and Firefox, all good ✅", 1]] },
    { n: 20, type: "task", title: "Keyboard shortcuts cheat sheet", sprint: "s-scr-3", assignee: "u-ava", points: 2, priority: "low", created: 6, labels: ["design"] },
    { n: 21, type: "bug", title: "Sprint dates show in the wrong timezone", sprint: "s-scr-3", assignee: "u-me", points: 2, priority: "high", created: 5, moves: [["in_progress", 3], ["done", 2]], labels: ["backend"] },
    { n: 22, type: "story", title: "Filter board by assignee and type", epic: 2, sprint: "s-scr-3", assignee: "u-me", points: 3, created: 6, moves: [["in_progress", 1]], labels: ["board", "frontend"], due: 2 },
    { n: 23, type: "task", title: "Write onboarding docs", sprint: "s-scr-3", assignee: null, points: 2, priority: "lowest", created: 6, labels: ["docs"] },

    // Sprint 4 (planned)
    { n: 24, type: "story", title: "Google SSO", epic: 1, sprint: "s-scr-4", assignee: "u-omar", points: 5, created: 5, labels: ["auth"] },
    { n: 25, type: "story", title: "Team workload report", epic: 3, sprint: "s-scr-4", assignee: "u-sarah", points: 5, created: 4, labels: ["reports"] },
    { n: 26, type: "task", title: "Accessibility audit", sprint: "s-scr-4", assignee: "u-ava", points: 3, created: 4, labels: ["design", "a11y"] },

    // Backlog
    { n: 27, type: "story", title: "Two-factor authentication", epic: 1, assignee: null, points: 8, priority: "medium", created: 12, labels: ["auth", "security"] },
    { n: 28, type: "story", title: "Swimlanes by assignee on the board", epic: 2, points: 5, priority: "low", created: 11, labels: ["board"] },
    { n: 29, type: "bug", title: "Long titles overflow the card on mobile", points: 1, priority: "medium", created: 9, labels: ["frontend", "mobile"] },
    { n: 30, type: "story", title: "Export issues to CSV", epic: 3, points: 3, priority: "low", created: 8, labels: ["reports"] },
    { n: 31, type: "task", title: "Upgrade to React 19", points: 2, priority: "medium", created: 7, assignee: "u-me", labels: ["devops"] },
    { n: 32, type: "story", title: "Slack notifications", points: null, priority: "lowest", created: 3, labels: ["integrations"] },
    { n: 33, type: "bug", title: "Search ignores issue keys", points: 2, priority: "high", created: 2, labels: ["frontend"] },
  ]

  const mob: SeedIssue[] = [
    { n: 1, type: "epic", title: "App foundation", status: "in_progress", created: 15, assignee: "u-kai", priority: "high" },
    { n: 2, type: "story", title: "Expo project setup", epic: 1, sprint: "s-mob-1", assignee: "u-kai", points: 3, created: 12, moves: [["in_progress", 3], ["done", 2]] },
    { n: 3, type: "story", title: "Sign in screen", epic: 1, sprint: "s-mob-1", assignee: "u-ava", points: 5, created: 10, moves: [["in_progress", 1]] },
    { n: 4, type: "story", title: "Push notifications", sprint: "s-mob-1", assignee: "u-omar", points: 5, created: 8 },
    { n: 5, type: "bug", title: "Splash screen stretches on tablets", sprint: "s-mob-1", assignee: "u-leo", points: 1, priority: "low", created: 4 },
    { n: 6, type: "story", title: "Offline mode", points: 8, created: 3 },
  ]

  const issues = [...build(now, "p-scr", "SCR", scr), ...build(now, "p-mob", "MOB", mob)]
  return { users: USERS, projects, sprints, issues }
}
