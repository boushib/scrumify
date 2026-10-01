"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import classNames from "classnames"
import { Plus } from "lucide-react"
import { useState } from "react"
import IssueCard from "@/components/IssueCard"
import IssueTypeIcon from "@/components/ui/IssueTypeIcon"
import type { Issue, IssueType, Project, Status } from "@/models"
import { useStore } from "@/store"
import { sumPoints } from "@/store/selectors"
import styles from "./Board.module.sass"

interface Props {
  project: Project
  sprintId: string
  status: Status
  /** Issues shown in this column (after filters) */
  issues: Issue[]
  /** All sprint issues in this status, for the WIP limit */
  total: number
  onOpen: (id: string) => void
}

const SortableCard = ({
  issue,
  done,
  index,
  onOpen,
}: {
  issue: Issue
  done: boolean
  index: number
  onOpen: (id: string) => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={classNames(styles.sortable, isDragging && styles.placeholder)}
      {...attributes}
      {...listeners}
    >
      <IssueCard issue={issue} done={done} index={index} onOpen={() => onOpen(issue.id)} />
    </div>
  )
}

const QUICK_TYPES: IssueType[] = ["story", "task", "bug"]

const QuickAdd = ({ project, sprintId, statusId }: { project: Project; sprintId: string; statusId: string }) => {
  const createIssue = useStore(s => s.createIssue)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<IssueType>("task")

  if (!open) {
    return (
      <button type="button" className={styles.quickAddButton} onClick={() => setOpen(true)}>
        <Plus size={16} /> Create issue
      </button>
    )
  }

  const submit = () => {
    if (!title.trim()) return
    createIssue({ projectId: project.id, type, title, sprintId, statusId })
    setTitle("")
  }

  return (
    <form
      className={styles.quickAdd}
      onSubmit={e => {
        e.preventDefault()
        submit()
      }}
    >
      <textarea
        autoFocus
        rows={2}
        value={title}
        placeholder="What needs to be done?"
        aria-label="Issue title"
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
          if (e.key === "Escape") setOpen(false)
        }}
        onBlur={() => !title.trim() && setOpen(false)}
      />
      <div className={styles.quickAddFooter}>
        <div className={styles.quickAddTypes} role="radiogroup" aria-label="Issue type">
          {QUICK_TYPES.map(t => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              className={classNames(styles.quickAddType, type === t && styles.quickAddTypeActive)}
              onMouseDown={e => e.preventDefault()}
              onClick={() => setType(t)}
              title={t}
            >
              <IssueTypeIcon type={t} />
            </button>
          ))}
        </div>
        <span className={styles.quickAddHint}>Enter to create</span>
      </div>
    </form>
  )
}

const BoardColumn = ({ project, sprintId, status, issues, total, onOpen }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id: status.id })
  const overLimit = status.wipLimit > 0 && total > status.wipLimit
  const done = status.category === "done"
  const points = sumPoints(issues)

  return (
    <section className={classNames(styles.column, overLimit && styles.columnOverLimit, isOver && styles.columnOver)}>
      <header className={styles.columnHeader}>
        <h2 className={styles.columnTitle}>
          {status.name}
          <span className={styles.count}>
            {total}
            {status.wipLimit > 0 && ` / ${status.wipLimit}`}
          </span>
        </h2>
        {points > 0 && (
          <span className={styles.columnPoints} title="Story points">
            {points} pts
          </span>
        )}
      </header>
      {overLimit && <p className={styles.wipWarning}>WIP limit exceeded</p>}
      <SortableContext id={status.id} items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={`${styles.cards} scroller`}>
          {issues.map((issue, index) => (
            <SortableCard key={issue.id} issue={issue} done={done} index={index} onOpen={onOpen} />
          ))}
          {issues.length === 0 && <div className={styles.dropHint}>Drop issues here</div>}
          <QuickAdd project={project} sprintId={sprintId} statusId={status.id} />
        </div>
      </SortableContext>
    </section>
  )
}

export default BoardColumn
