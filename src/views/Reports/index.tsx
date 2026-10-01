"use client"

import Link from "next/link"
import { useMemo } from "react"
import PageHeader, { ProjectNotFound } from "@/components/PageHeader"
import Avatar from "@/components/ui/Avatar"
import { useNow } from "@/hooks/useNow"
import { useProject } from "@/hooks/useProject"
import { burndown, statusBreakdown, velocity, workload } from "@/lib/reports"
import type { Project } from "@/models"
import { useStore } from "@/store"
import { activeSprintOf, isDone, issuesOf, sumPoints } from "@/store/selectors"
import { BurndownChart, DonutChart, VelocityChart } from "./charts"
import styles from "./Reports.module.sass"

const DAY = 24 * 60 * 60 * 1000
const CATEGORY_COLORS = { todo: "var(--todo)", in_progress: "var(--progress)", done: "var(--done)" }
const EXTRA_COLORS = ["#8f7ee7", "#e2b203", "#2abb7f", "#f87168"]

/** One color per status; a second status in the same category gets a distinct shade */
const statusColors = (project: Project) => {
  const used = new Set<string>()
  let extra = 0
  return Object.fromEntries(
    project.statuses.map(s => {
      let color: string = CATEGORY_COLORS[s.category]
      if (used.has(s.category)) color = EXTRA_COLORS[extra++ % EXTRA_COLORS.length]
      used.add(s.category)
      return [s.id, color]
    })
  )
}

const Stat = ({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) => (
  <div className={styles.stat}>
    <span className={styles.statLabel}>{label}</span>
    <strong className={styles.statValue}>{value}</strong>
    {hint && <span className={styles.statHint}>{hint}</span>}
  </div>
)

const ReportsView = () => {
  const project = useProject()
  const sprints = useStore(s => s.sprints)
  const allIssues = useStore(s => s.issues)
  const users = useStore(s => s.users)
  const now = useNow()

  const sprint = project ? activeSprintOf(sprints, project.id) : undefined
  const issues = useMemo(
    () => (project ? issuesOf(allIssues, project.id).filter(i => i.type !== "epic") : []),
    [allIssues, project]
  )
  const sprintIssues = useMemo(() => (sprint ? issues.filter(i => i.sprintId === sprint.id) : []), [issues, sprint])
  const burn = useMemo(
    () => (project && sprint ? burndown(project, sprint, issues, now) : []),
    [project, sprint, issues, now]
  )
  const velo = useMemo(() => (project ? velocity(project, sprints, issues) : []), [project, sprints, issues])

  if (!project) return <ProjectNotFound />

  const scope = sprintIssues
  const donePoints = sumPoints(scope.filter(i => isDone(project, i)))
  const totalPoints = sumPoints(scope)
  const progress = totalPoints ? Math.round((donePoints / totalPoints) * 100) : 0
  const daysLeft = sprint?.endDate ? Math.max(0, Math.ceil((sprint.endDate - now) / DAY)) : null
  const completed = velo.filter(v => v.sprint.state === "completed")
  const avgVelocity = completed.length ? Math.round(completed.reduce((s, v) => s + v.completed, 0) / completed.length) : null
  const openBugs = issues.filter(i => i.type === "bug" && !isDone(project, i)).length
  const breakdownSource = sprint ? sprintIssues : issues
  const load = workload(project, breakdownSource)
  const maxLoad = Math.max(1, ...load.map(l => l.todo + l.in_progress + l.done))

  return (
    <div className={`${styles.page} scroller`}>
      <PageHeader
        project={project}
        title="Reports"
        subtitle={sprint ? `${sprint.name}${sprint.goal ? ` · ${sprint.goal}` : ""}` : "No active sprint"}
      />

      <div className={styles.stats}>
        <Stat
          label="Sprint progress"
          value={sprint ? `${progress}%` : "–"}
          hint={
            sprint ? (
              <span className={styles.progressBar}>
                <span style={{ width: `${progress}%` }} />
              </span>
            ) : undefined
          }
        />
        <Stat label="Points done" value={sprint ? `${donePoints} / ${totalPoints}` : "–"} hint="in the active sprint" />
        <Stat label="Days left" value={daysLeft ?? "–"} hint={sprint ? "until the sprint ends" : undefined} />
        <Stat label="Average velocity" value={avgVelocity ?? "–"} hint={`points over ${completed.length} completed sprints`} />
        <Stat label="Open bugs" value={openBugs} hint="across the project" />
      </div>

      <div className={styles.grid}>
        <section className={`${styles.card} ${styles.wide}`}>
          <header className={styles.cardHeader}>
            <h2>Burndown</h2>
            <span>Story points remaining in {sprint?.name ?? "the active sprint"}</span>
          </header>
          {sprint ? (
            <BurndownChart points={burn} now={now} />
          ) : (
            <p className={styles.empty}>
              Start a sprint from the <Link href={`/projects/${project.key}/backlog`}>backlog</Link> to track its burndown.
            </p>
          )}
        </section>

        <section className={`${styles.card} ${styles.wide}`}>
          <header className={styles.cardHeader}>
            <h2>Velocity</h2>
            <span>Points committed vs completed per sprint</span>
          </header>
          <VelocityChart data={velo} />
        </section>

        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>Status</h2>
            <span>{sprint ? "Issues in the active sprint" : "All issues"}</span>
          </header>
          <DonutChart slices={statusBreakdown(project, breakdownSource)} colors={statusColors(project)} />
        </section>

        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>Workload</h2>
            <span>Story points per assignee</span>
          </header>
          {load.length ? (
            <ul className={styles.workload}>
              {load.map(row => {
                const user = users.find(u => u.id === row.userId)
                const total = row.todo + row.in_progress + row.done
                return (
                  <li key={row.userId ?? "none"}>
                    <span className={styles.workloadName}>
                      <Avatar user={user} size={24} />
                      <span>{user?.name ?? "Unassigned"}</span>
                    </span>
                    <span className={styles.workloadBar} title={`To do ${row.todo} · In progress ${row.in_progress} · Done ${row.done}`}>
                      <span style={{ width: `${(row.done / maxLoad) * 100}%`, backgroundColor: "var(--done)" }} />
                      <span style={{ width: `${(row.in_progress / maxLoad) * 100}%`, backgroundColor: "var(--progress)" }} />
                      <span style={{ width: `${(row.todo / maxLoad) * 100}%`, backgroundColor: "var(--todo)" }} />
                    </span>
                    <strong>{total}</strong>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className={styles.empty}>No issues yet.</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default ReportsView
