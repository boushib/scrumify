"use client"

import classNames from "classnames"
import { CalendarClock, CheckSquare, MessageSquare } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import IssueTypeIcon from "@/components/ui/IssueTypeIcon"
import PriorityIcon from "@/components/ui/PriorityIcon"
import { useNow } from "@/hooks/useNow"
import { formatShortDate } from "@/lib/format"
import type { Issue } from "@/models"
import { useStore } from "@/store"
import styles from "./IssueCard.module.sass"

interface Props {
  issue: Issue
  done?: boolean
  dragging?: boolean
  /** Position in its list, for the staggered entrance */
  index?: number
  onOpen?: () => void
}

const DAY = 24 * 60 * 60 * 1000

const IssueCard = ({ issue, done, dragging, index = 0, onOpen }: Props) => {
  const assignee = useStore(s => s.users.find(u => u.id === issue.assigneeId))
  const epic = useStore(s => (issue.epicId ? s.issues[issue.epicId] : undefined))
  const checked = issue.checklist.filter(k => k.done).length
  const now = useNow()
  const dueSoon = issue.dueDate !== null && !done && issue.dueDate - now < 2 * DAY

  return (
    <article
      className={classNames(styles.card, dragging && styles.dragging, done && styles.done)}
      style={{ "--delay": `${Math.min(index, 12) * 35}ms` } as React.CSSProperties}
      onClick={onOpen}
      onKeyDown={e => e.key === "Enter" && onOpen?.()}
      tabIndex={0}
      aria-label={`${issue.id}: ${issue.title}`}
    >
      <p className={styles.title}>{issue.title}</p>
      {(epic || issue.labels.length > 0) && (
        <div className={styles.chips}>
          {epic && <span className={styles.epic}>{epic.title}</span>}
          {issue.labels.slice(0, 2).map(label => (
            <span key={label} className={styles.label}>
              {label}
            </span>
          ))}
        </div>
      )}
      <footer className={styles.footer}>
        <IssueTypeIcon type={issue.type} />
        <span className={classNames(styles.key, done && styles.keyDone)}>{issue.id}</span>
        <span className={styles.meta}>
          {issue.dueDate !== null && (
            <span className={classNames(styles.badge, dueSoon && styles.badgeWarn)} title="Due date">
              <CalendarClock size={12} /> {formatShortDate(issue.dueDate)}
            </span>
          )}
          {issue.checklist.length > 0 && (
            <span className={styles.badge} title="Checklist">
              <CheckSquare size={12} /> {checked}/{issue.checklist.length}
            </span>
          )}
          {issue.comments.length > 0 && (
            <span className={styles.badge} title="Comments">
              <MessageSquare size={12} /> {issue.comments.length}
            </span>
          )}
          <PriorityIcon priority={issue.priority} />
          {issue.points !== null && <span className={styles.points}>{issue.points}</span>}
          <Avatar user={assignee} size={22} />
        </span>
      </footer>
    </article>
  )
}

export default IssueCard
