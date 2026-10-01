"use client"

import { ArrowRight } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { useNow } from "@/hooks/useNow"
import { formatDateTime, formatRelative } from "@/lib/format"
import type { Issue, Project } from "@/models"
import { useStore } from "@/store"
import { describeActivity } from "./describeActivity"
import styles from "./IssueModal.module.sass"

const History = ({ issue, project }: { issue: Issue; project: Project }) => {
  const users = useStore(s => s.users)
  const sprints = useStore(s => s.sprints)
  const issues = useStore(s => s.issues)
  const now = useNow()
  const entries = [...issue.activity].reverse()

  return (
    <ul className={styles.history}>
      {entries.map(entry => {
        const actor = users.find(u => u.id === entry.actorId)
        const text = describeActivity(entry, { project, users, sprints, issues })
        return (
          <li key={entry.id} className={styles.historyItem}>
            <Avatar user={actor} size={28} />
            <div>
              <p>
                <strong>{actor?.name ?? "Someone"}</strong> {text.action}{" "}
                <time className={styles.muted} title={formatDateTime(entry.at)}>
                  {formatRelative(entry.at, now)}
                </time>
              </p>
              {text.from !== undefined && (
                <p className={styles.change}>
                  <span>{text.from}</span>
                  <ArrowRight size={14} />
                  <span>{text.to}</span>
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default History
