"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import classNames from "classnames"
import { ChevronDown, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import Button from "@/components/ui/Button"
import IssueTypeIcon from "@/components/ui/IssueTypeIcon"
import Popover, { Menu, MenuItem, usePopover } from "@/components/ui/Popover"
import { formatShortDate } from "@/lib/format"
import type { Issue, IssueType, Project, Sprint } from "@/models"
import { useStore } from "@/store"
import { statusById } from "@/store/selectors"
import IssueRow from "./IssueRow"
import styles from "./Backlog.module.sass"

export const BACKLOG = "backlog"

interface Props {
  project: Project
  /** null renders the backlog section */
  sprint: Sprint | null
  /** Issues shown (after filters) */
  issues: Issue[]
  /** Every issue in the sprint, for totals */
  allIssues: Issue[]
  canStart: boolean
  onOpen: (id: string) => void
  onStart?: () => void
  onComplete?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onCreateSprint?: () => void
}

const QuickCreate = ({ project, sprintId }: { project: Project; sprintId: string | null }) => {
  const createIssue = useStore(s => s.createIssue)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<IssueType>("story")

  if (!open) {
    return (
      <button type="button" className={styles.createRow} onClick={() => setOpen(true)}>
        <Plus size={16} /> Create issue
      </button>
    )
  }

  return (
    <form
      className={styles.createForm}
      onSubmit={e => {
        e.preventDefault()
        if (!title.trim()) return
        createIssue({ projectId: project.id, type, title, sprintId })
        setTitle("")
      }}
    >
      <button
        type="button"
        className={styles.createType}
        title="Change type"
        onMouseDown={e => e.preventDefault()}
        onClick={() => setType(t => (t === "story" ? "task" : t === "task" ? "bug" : "story"))}
      >
        <IssueTypeIcon type={type} />
      </button>
      <input
        autoFocus
        value={title}
        placeholder="What needs to be done?"
        aria-label="Issue summary"
        onChange={e => setTitle(e.target.value)}
        onBlur={() => !title.trim() && setOpen(false)}
        onKeyDown={e => e.key === "Escape" && setOpen(false)}
      />
      <span className={styles.createHint}>Enter to create</span>
    </form>
  )
}

const SprintSection = (props: Props) => {
  const { project, sprint, issues, allIssues, canStart, onOpen } = props
  const id = sprint?.id ?? BACKLOG
  const { setNodeRef, isOver } = useDroppable({ id })
  const [collapsed, setCollapsed] = useState(sprint?.state === "planned" && allIssues.length > 8)
  const menu = usePopover()

  const totals = { todo: 0, in_progress: 0, done: 0 }
  for (const issue of allIssues) totals[statusById(project, issue.statusId).category] += issue.points ?? 0

  return (
    <section className={classNames(styles.section, isOver && styles.sectionOver)}>
      <header className={styles.sectionHeader}>
        <button
          type="button"
          className={styles.collapse}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(c => !c)}
        >
          <ChevronDown size={16} className={classNames(styles.chevron, collapsed && styles.chevronCollapsed)} />
          <h2>{sprint ? sprint.name : "Backlog"}</h2>
        </button>
        {sprint?.startDate && sprint.endDate && (
          <span className={styles.dates}>
            {formatShortDate(sprint.startDate)} – {formatShortDate(sprint.endDate)}
          </span>
        )}
        <span className={styles.issueCount}>
          ({allIssues.length} {allIssues.length === 1 ? "issue" : "issues"})
        </span>

        <div className={styles.sectionTail}>
          <span className={styles.totals} title="Story points: to do, in progress, done">
            <span className={styles.total_todo}>{totals.todo}</span>
            <span className={styles.total_in_progress}>{totals.in_progress}</span>
            <span className={styles.total_done}>{totals.done}</span>
          </span>
          {sprint?.state === "active" && (
            <Button size="sm" onClick={props.onComplete}>
              Complete sprint
            </Button>
          )}
          {sprint?.state === "planned" && (
            <Button
              size="sm"
              variant="primary"
              disabled={!canStart || allIssues.length === 0}
              title={
                !canStart ? "Complete the active sprint first" : allIssues.length === 0 ? "Add issues to start" : undefined
              }
              onClick={props.onStart}
            >
              Start sprint
            </Button>
          )}
          {!sprint && (
            <Button size="sm" onClick={props.onCreateSprint}>
              Create sprint
            </Button>
          )}
          {sprint && (
            <>
              <Button size="sm" variant="subtle" icon={<MoreHorizontal size={16} />} aria-label="Sprint actions" {...menu.triggerProps} />
              {menu.anchor && (
                <Popover anchor={menu.anchor} onClose={menu.close} align="end">
                  <Menu>
                    <MenuItem
                      icon={<Pencil size={16} />}
                      label="Edit sprint"
                      onClick={() => {
                        menu.close()
                        props.onEdit?.()
                      }}
                    />
                    {sprint.state === "planned" && (
                      <MenuItem
                        icon={<Trash2 size={16} />}
                        label="Delete sprint"
                        danger
                        onClick={() => {
                          menu.close()
                          props.onDelete?.()
                        }}
                      />
                    )}
                  </Menu>
                </Popover>
              )}
            </>
          )}
        </div>
      </header>
      {sprint?.goal && !collapsed && <p className={styles.goal}>{sprint.goal}</p>}

      {!collapsed && (
        <SortableContext id={id} items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className={styles.list}>
            {issues.map(issue => (
              <IssueRow key={issue.id} issue={issue} project={project} onOpen={onOpen} />
            ))}
            {issues.length === 0 && (
              <div className={styles.emptyList}>
                {allIssues.length
                  ? "No issues match your filters."
                  : sprint
                    ? "Plan this sprint by dragging issues here from the backlog."
                    : "Your backlog is empty. Create an issue to get started."}
              </div>
            )}
          </div>
          <QuickCreate project={project} sprintId={sprint?.id ?? null} />
        </SortableContext>
      )}
    </section>
  )
}

export default SprintSection
