"use client"

import classNames from "classnames"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import type { Issue } from "@/models"
import { useStore } from "@/store"
import styles from "./IssueModal.module.sass"

const Checklist = ({ issue }: { issue: Issue }) => {
  const addItem = useStore(s => s.addChecklistItem)
  const toggleItem = useStore(s => s.toggleChecklistItem)
  const removeItem = useStore(s => s.removeChecklistItem)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const done = issue.checklist.filter(k => k.done).length
  const percent = issue.checklist.length ? Math.round((done / issue.checklist.length) * 100) : 0

  const submit = () => {
    if (draft.trim()) addItem(issue.id, draft.trim())
    setDraft("")
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Checklist</h3>
        {issue.checklist.length > 0 && (
          <span className={styles.muted}>
            {done} of {issue.checklist.length} done
          </span>
        )}
      </div>
      {issue.checklist.length > 0 && (
        <div className={styles.progress} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${percent}%` }} />
        </div>
      )}
      <ul className={styles.checklist}>
        {issue.checklist.map(item => (
          <li key={item.id} className={classNames(styles.checkItem, item.done && styles.checkItemDone)}>
            <label>
              <input type="checkbox" checked={item.done} onChange={() => toggleItem(issue.id, item.id)} />
              <span>{item.text}</span>
            </label>
            <button type="button" aria-label={`Remove ${item.text}`} onClick={() => removeItem(issue.id, item.id)}>
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <form
          className={styles.checkForm}
          onSubmit={e => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            autoFocus
            value={draft}
            placeholder="Add an item"
            aria-label="New checklist item"
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Escape") {
                e.stopPropagation()
                setAdding(false)
              }
            }}
            onBlur={() => !draft.trim() && setAdding(false)}
          />
        </form>
      ) : (
        <button type="button" className={styles.addButton} onClick={() => setAdding(true)}>
          <Plus size={14} /> Add item
        </button>
      )}
    </section>
  )
}

export default Checklist
