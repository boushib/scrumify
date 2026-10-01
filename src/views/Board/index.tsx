"use client"

import IssueCard from "@/components/IssueCard"
import PageHeader, { ProjectNotFound } from "@/components/PageHeader"
import { useProject } from "@/hooks/useProject"
import { useStore } from "@/store"
import { activeSprintOf, byRank, issuesOf } from "@/store/selectors"
import styles from "./Board.module.sass"

const BoardView = () => {
  const project = useProject()
  const sprints = useStore(s => s.sprints)
  const allIssues = useStore(s => s.issues)
  if (!project) return <ProjectNotFound />

  const sprint = activeSprintOf(sprints, project.id)
  const issues = issuesOf(allIssues, project.id).filter(i => i.type !== "epic" && sprint && i.sprintId === sprint.id)

  return (
    <div className={styles.page}>
      <PageHeader project={project} title={sprint?.name ?? "Board"} subtitle={sprint?.goal} />
      <div className={styles.columns}>
        {project.statuses.map(status => {
          const column = issues.filter(i => i.statusId === status.id).sort(byRank)
          return (
            <section key={status.id} className={styles.column}>
              <h2 className={styles.columnTitle}>
                {status.name} <span>{column.length}</span>
              </h2>
              <div className={styles.cards}>
                {column.map(issue => (
                  <IssueCard key={issue.id} issue={issue} done={status.category === "done"} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default BoardView
