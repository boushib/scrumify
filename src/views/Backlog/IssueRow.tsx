"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import classNames from "classnames"
import Avatar from "@/components/ui/Avatar"
import IssueTypeIcon from "@/components/ui/IssueTypeIcon"
import PriorityIcon from "@/components/ui/PriorityIcon"
import StatusSelect from "@/components/ui/StatusSelect"
import type { Issue, Project } from "@/models"
import { useStore } from "@/store"
import { isDone } from "@/store/selectors"
import styles from "./Backlog.module.sass"

interface Props {
  issue: Issue
  project: Project
  onOpen?: (id: string) => void
  overlay?: boolean
}

export const IssueRowContent = ({ issue, project, onOpen, overlay }: Props) => {
  const assignee = useStore(s => s.users.find(u => u.id === issue.assigneeId))
  const epic = useStore(s => (issue.epicId ? s.issues[issue.epicId] : undefined))
  const moveIssue = useStore(s => s.moveIssue)
  const done = isDone(project, issue)

  return (
    <div
      className={classNames(styles.row, overlay && styles.rowOverlay)}
      onClick={() => onOpen?.(issue.id)}
      onKeyDown={e => e.key === "Enter" && e.target === e.currentTarget && onOpen?.(issue.id)}
      tabIndex={-1}
    >
      <IssueTypeIcon type={issue.type} />
      <span className={classNames(styles.rowKey, done && styles.rowKeyDone)}>{issue.id}</span>
      <span className={styles.rowTitle}>{issue.title}</span>
      {epic && <span className={styles.rowEpic}>{epic.title}</span>}
      <span className={styles.rowMeta} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
        <StatusSelect size="sm" statuses={project.statuses} value={issue.statusId} onChange={id => moveIssue(issue.id, id)} />
      </span>
      <PriorityIcon priority={issue.priority} />
      <span className={classNames(styles.rowPoints, issue.points === null && styles.rowPointsEmpty)}>{issue.points ?? "–"}</span>
      <Avatar user={assignee} size={24} />
    </div>
  )
}

const IssueRow = (props: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.issue.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={classNames(styles.sortable, isDragging && styles.placeholder)}
      aria-label={`${props.issue.id}: ${props.issue.title}`}
      {...attributes}
      {...listeners}
    >
      <IssueRowContent {...props} />
    </div>
  )
}

export default IssueRow
