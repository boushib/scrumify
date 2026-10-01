"use client"

import { X } from "lucide-react"
import { useId, useState } from "react"
import Avatar from "@/components/ui/Avatar"
import IssueTypeIcon, { ISSUE_TYPES } from "@/components/ui/IssueTypeIcon"
import PriorityIcon, { PRIORITIES } from "@/components/ui/PriorityIcon"
import Select from "@/components/ui/Select"
import { formatDateTime } from "@/lib/format"
import type { Issue, IssueType, Priority, Project } from "@/models"
import { CURRENT_USER_ID, useStore } from "@/store"
import styles from "./IssueModal.module.sass"

const POINTS = ["0", "1", "2", "3", "5", "8", "13", "21"]

/** yyyy-mm-dd in local time, for <input type="date"> */
const toDateInput = (ts: number | null) => {
  if (ts === null) return ""
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const fromDateInput = (value: string) => {
  if (!value) return null
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d).getTime()
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    <div className={styles.fieldValue}>{children}</div>
  </div>
)

const Labels = ({ issue, suggestions }: { issue: Issue; suggestions: string[] }) => {
  const updateIssue = useStore(s => s.updateIssue)
  const [draft, setDraft] = useState("")
  const listId = useId()

  const add = () => {
    const label = draft.trim().toLowerCase().replace(/\s+/g, "-")
    if (label && !issue.labels.includes(label)) updateIssue(issue.id, { labels: [...issue.labels, label] })
    setDraft("")
  }

  return (
    <div className={styles.labels}>
      {issue.labels.map(label => (
        <span key={label} className={styles.labelChip}>
          {label}
          <button
            type="button"
            aria-label={`Remove label ${label}`}
            onClick={() => updateIssue(issue.id, { labels: issue.labels.filter(l => l !== label) })}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        className={styles.labelInput}
        value={draft}
        list={listId}
        placeholder={issue.labels.length ? "Add…" : "Add a label"}
        aria-label="Add label"
        onChange={e => setDraft(e.target.value)}
        onBlur={add}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            add()
          }
          if (e.key === "Backspace" && !draft && issue.labels.length) {
            updateIssue(issue.id, { labels: issue.labels.slice(0, -1) })
          }
        }}
      />
      <datalist id={listId}>
        {suggestions
          .filter(s => !issue.labels.includes(s))
          .map(s => (
            <option key={s} value={s} />
          ))}
      </datalist>
    </div>
  )
}

const DetailsPanel = ({ issue, project }: { issue: Issue; project: Project }) => {
  const users = useStore(s => s.users)
  const sprints = useStore(s => s.sprints)
  const issues = useStore(s => s.issues)
  const updateIssue = useStore(s => s.updateIssue)
  const planIssue = useStore(s => s.planIssue)
  const reporter = users.find(u => u.id === issue.reporterId)

  const projectIssues = Object.values(issues).filter(i => i.projectId === project.id)
  const epics = projectIssues.filter(i => i.type === "epic" && i.id !== issue.id)
  const openSprints = sprints.filter(s => s.projectId === project.id && (s.state !== "completed" || s.id === issue.sprintId))
  const labelSuggestions = [...new Set(projectIssues.flatMap(i => i.labels))].sort()

  return (
    <div className={styles.details}>
      <h3 className={styles.detailsTitle}>Details</h3>

      <Field label="Assignee">
        <Select
          compact
          label="Assignee"
          value={issue.assigneeId ?? "none"}
          onChange={id => updateIssue(issue.id, { assigneeId: id === "none" ? null : id })}
          options={[
            { value: "none", label: "Unassigned", icon: <Avatar size={22} /> },
            ...users.map(u => ({ value: u.id, label: u.name, icon: <Avatar user={u} size={22} /> })),
          ]}
        />
        {issue.assigneeId !== CURRENT_USER_ID && (
          <button
            type="button"
            className={styles.assignMe}
            onClick={() => updateIssue(issue.id, { assigneeId: CURRENT_USER_ID })}
          >
            Assign to me
          </button>
        )}
      </Field>

      <Field label="Reporter">
        <span className={styles.static}>
          <Avatar user={reporter} size={22} /> {reporter?.name ?? "Unknown"}
        </span>
      </Field>

      <Field label="Type">
        <Select<IssueType>
          compact
          label="Issue type"
          value={issue.type}
          onChange={type => updateIssue(issue.id, { type, ...(type === "epic" ? { epicId: null, sprintId: null } : {}) })}
          options={ISSUE_TYPES.map(t => ({ value: t.type, label: t.label, icon: <IssueTypeIcon type={t.type} /> }))}
        />
      </Field>

      <Field label="Priority">
        <Select<Priority>
          compact
          label="Priority"
          value={issue.priority}
          onChange={priority => updateIssue(issue.id, { priority })}
          options={PRIORITIES.map(p => ({ value: p.priority, label: p.label, icon: <PriorityIcon priority={p.priority} /> }))}
        />
      </Field>

      {issue.type !== "epic" && (
        <>
          <Field label="Story points">
            <Select
              compact
              label="Story points"
              value={issue.points === null ? "none" : String(issue.points)}
              onChange={v => updateIssue(issue.id, { points: v === "none" ? null : Number(v) })}
              options={[{ value: "none", label: "None" }, ...POINTS.map(p => ({ value: p, label: p }))]}
            />
          </Field>

          <Field label="Sprint">
            <Select
              compact
              label="Sprint"
              value={issue.sprintId ?? "backlog"}
              onChange={v => planIssue(issue.id, v === "backlog" ? null : v)}
              options={[
                { value: "backlog", label: "Backlog" },
                ...openSprints.map(s => ({ value: s.id, label: s.state === "active" ? `${s.name} (active)` : s.name })),
              ]}
            />
          </Field>

          <Field label="Epic">
            <Select
              compact
              label="Epic"
              value={issue.epicId ?? "none"}
              onChange={v => updateIssue(issue.id, { epicId: v === "none" ? null : v })}
              options={[
                { value: "none", label: "None" },
                ...epics.map(e => ({ value: e.id, label: e.title, icon: <IssueTypeIcon type="epic" /> })),
              ]}
            />
          </Field>
        </>
      )}

      <Field label="Labels">
        <Labels issue={issue} suggestions={labelSuggestions} />
      </Field>

      <Field label="Due date">
        <input
          type="date"
          className={styles.dateInput}
          value={toDateInput(issue.dueDate)}
          aria-label="Due date"
          onChange={e => updateIssue(issue.id, { dueDate: fromDateInput(e.target.value) })}
        />
      </Field>

      <dl className={styles.timestamps}>
        <div>
          <dt>Created</dt>
          <dd>{formatDateTime(issue.createdAt)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDateTime(issue.updatedAt)}</dd>
        </div>
      </dl>
    </div>
  )
}

export default DetailsPanel
