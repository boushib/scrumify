"use client"

import classNames from "classnames"
import { Search, X } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { ISSUE_TYPES } from "@/components/ui/IssueTypeIcon"
import { PRIORITIES } from "@/components/ui/PriorityIcon"
import Select from "@/components/ui/Select"
import type { Issue, IssueType, Priority } from "@/models"
import { CURRENT_USER_ID, useStore } from "@/store"
import styles from "./Board.module.sass"

export interface Filters {
  query: string
  /** Assignee ids; "none" matches unassigned issues */
  assignees: string[]
  type: IssueType | "all"
  priority: Priority | "all"
  mine: boolean
}

export const EMPTY_FILTERS: Filters = { query: "", assignees: [], type: "all", priority: "all", mine: false }

export const applyFilters = (issues: Issue[], f: Filters) => {
  const query = f.query.trim().toLowerCase()
  return issues.filter(
    i =>
      (!query ||
        i.title.toLowerCase().includes(query) ||
        i.id.toLowerCase().includes(query) ||
        i.labels.some(l => l.toLowerCase().includes(query))) &&
      (!f.assignees.length || f.assignees.includes(i.assigneeId ?? "none")) &&
      (f.type === "all" || i.type === f.type) &&
      (f.priority === "all" || i.priority === f.priority) &&
      (!f.mine || i.assigneeId === CURRENT_USER_ID)
  )
}

interface Props {
  issues: Issue[]
  filters: Filters
  onChange: (filters: Filters) => void
}

const BoardFilters = ({ issues, filters, onChange }: Props) => {
  const users = useStore(s => s.users)
  // Only people with work in this sprint get an avatar
  const assigneeIds = new Set(issues.map(i => i.assigneeId))
  const people = users.filter(u => assigneeIds.has(u.id))
  const active =
    filters.query || filters.assignees.length || filters.type !== "all" || filters.priority !== "all" || filters.mine

  const toggleAssignee = (id: string) =>
    onChange({
      ...filters,
      assignees: filters.assignees.includes(id) ? filters.assignees.filter(a => a !== id) : [...filters.assignees, id],
    })

  return (
    <div className={styles.filters}>
      <label className={styles.search}>
        <Search size={16} />
        <input
          value={filters.query}
          placeholder="Search this board"
          aria-label="Search this board"
          onChange={e => onChange({ ...filters, query: e.target.value })}
          onKeyDown={e => e.key === "Escape" && onChange({ ...filters, query: "" })}
        />
      </label>

      <div className={styles.avatars} role="group" aria-label="Filter by assignee">
        {people.map(user => (
          <button
            key={user.id}
            type="button"
            aria-pressed={filters.assignees.includes(user.id)}
            className={classNames(styles.avatarFilter, filters.assignees.includes(user.id) && styles.avatarFilterActive)}
            onClick={() => toggleAssignee(user.id)}
          >
            <Avatar user={user} size={30} />
          </button>
        ))}
        {assigneeIds.has(null) && (
          <button
            type="button"
            aria-pressed={filters.assignees.includes("none")}
            className={classNames(styles.avatarFilter, filters.assignees.includes("none") && styles.avatarFilterActive)}
            onClick={() => toggleAssignee("none")}
          >
            <Avatar size={30} />
          </button>
        )}
      </div>

      <button
        type="button"
        aria-pressed={filters.mine}
        className={classNames(styles.chip, filters.mine && styles.chipActive)}
        onClick={() => onChange({ ...filters, mine: !filters.mine })}
      >
        Only my issues
      </button>

      <Select
        compact
        label="Type"
        value={filters.type}
        onChange={type => onChange({ ...filters, type })}
        options={[
          { value: "all" as const, label: "All types" },
          ...ISSUE_TYPES.filter(t => t.type !== "epic").map(t => ({ value: t.type, label: t.label })),
        ]}
      />
      <Select
        compact
        label="Priority"
        value={filters.priority}
        onChange={priority => onChange({ ...filters, priority })}
        options={[
          { value: "all" as const, label: "All priorities" },
          ...PRIORITIES.map(p => ({ value: p.priority, label: p.label })),
        ]}
      />

      {active ? (
        <button type="button" className={styles.clear} onClick={() => onChange(EMPTY_FILTERS)}>
          <X size={14} /> Clear filters
        </button>
      ) : null}
    </div>
  )
}

export default BoardFilters
