"use client"

import classNames from "classnames"
import { ChevronRight, Link2, MoreHorizontal, Trash2, X } from "lucide-react"
import { useMemo, useState } from "react"
import Button from "@/components/ui/Button"
import Markdown from "@/components/Markdown"
import IssueTypeIcon from "@/components/ui/IssueTypeIcon"
import Popover, { Menu, MenuItem, usePopover } from "@/components/ui/Popover"
import StatusSelect from "@/components/ui/StatusSelect"
import { toast } from "@/components/ui/Toasts"
import type { Issue } from "@/models"
import { useStore } from "@/store"
import { useOpenIssue } from "."
import Checklist from "./Checklist"
import Comments from "./Comments"
import DetailsPanel from "./DetailsPanel"
import History from "./History"
import styles from "./IssueModal.module.sass"

interface Props {
  issue: Issue
  onClose: () => void
}

/** Text that turns into a field when clicked; saves on blur or Enter */
const EditableTitle = ({ value, onSave }: { value: string; onSave: (value: string) => void }) => {
  const [draft, setDraft] = useState(value)
  const save = () => {
    const next = draft.trim()
    if (next && next !== value) onSave(next)
    else setDraft(value)
  }
  return (
    <textarea
      className={styles.title}
      value={draft}
      rows={1}
      aria-label="Summary"
      onChange={e => setDraft(e.target.value.replace(/\n/g, ""))}
      onBlur={save}
      onKeyDown={e => {
        if (e.key === "Enter") {
          e.preventDefault()
          e.currentTarget.blur()
        }
        if (e.key === "Escape") {
          e.stopPropagation()
          setDraft(value)
          requestAnimationFrame(() => (e.target as HTMLTextAreaElement).blur())
        }
      }}
      // Grow with the text
      ref={el => {
        if (el) {
          el.style.height = "auto"
          el.style.height = `${el.scrollHeight}px`
        }
      }}
    />
  )
}

const Description = ({ value, onSave }: { value: string; onSave: (value: string) => void }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const startEditing = () => {
    setDraft(value)
    setEditing(true)
  }

  if (!editing) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="Edit description"
        className={classNames(styles.description, !value && styles.descriptionEmpty)}
        onClick={e => {
          // Links inside the description open normally
          if ((e.target as HTMLElement).closest("a")) return
          startEditing()
        }}
        onKeyDown={e => {
          if (e.key === "Enter" && e.target === e.currentTarget) {
            e.preventDefault()
            startEditing()
          }
        }}
      >
        {value ? <Markdown source={value} /> : "Add a description…"}
      </div>
    )
  }

  const save = () => {
    if (draft !== value) onSave(draft.trim())
    setEditing(false)
  }

  return (
    <div className={styles.editor}>
      <textarea
        autoFocus
        rows={6}
        value={draft}
        aria-label="Description"
        placeholder="Describe the work. Markdown works: **bold**, - lists, `code`, [links](https://…)"
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save()
          if (e.key === "Escape") {
            e.stopPropagation()
            setEditing(false)
          }
        }}
      />
      <div className={styles.editorActions}>
        <Button variant="primary" size="sm" onClick={save}>
          Save
        </Button>
        <Button variant="subtle" size="sm" onClick={() => setEditing(false)}>
          Cancel
        </Button>
        <span className={styles.editorHint}>⌘ Enter to save · Esc to cancel</span>
      </div>
    </div>
  )
}

const IssueDetail = ({ issue, onClose }: Props) => {
  const project = useStore(s => s.projects.find(p => p.id === issue.projectId))!
  const epic = useStore(s => (issue.epicId ? s.issues[issue.epicId] : undefined))
  const updateIssue = useStore(s => s.updateIssue)
  const moveIssue = useStore(s => s.moveIssue)
  const deleteIssue = useStore(s => s.deleteIssue)
  const restoreIssue = useStore(s => s.restoreIssue)
  const allIssues = useStore(s => s.issues)
  const children = useMemo(
    () => (issue.type === "epic" ? Object.values(allIssues).filter(i => i.epicId === issue.id) : undefined),
    [allIssues, issue.id, issue.type]
  )
  const openIssue = useOpenIssue()
  const more = usePopover()
  const [tab, setTab] = useState<"comments" | "history">("comments")

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast("Link copied to clipboard", "success")
    } catch {
      toast("Couldn’t copy the link", "danger")
    }
  }

  const remove = () => {
    more.close()
    const snapshot = issue
    // Epic children lose their link on delete; remember them for undo
    const linked = Object.values(useStore.getState().issues).filter(i => i.epicId === issue.id)
    deleteIssue(issue.id)
    onClose()
    toast(`${snapshot.id} deleted`, "info", {
      label: "Undo",
      onClick: () => {
        restoreIssue(snapshot)
        linked.forEach(child => restoreIssue({ ...useStore.getState().issues[child.id], epicId: snapshot.id }))
      },
    })
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.crumbs} aria-label="Issue location">
          <span className={styles.crumbProject}>
            <span className={styles.projectIcon} style={{ backgroundColor: project.color }}>
              {project.icon}
            </span>
            {project.name}
          </span>
          {epic && (
            <>
              <ChevronRight size={14} />
              <button type="button" className={styles.crumbLink} onClick={() => openIssue(epic.id)}>
                <IssueTypeIcon type="epic" size={14} /> {epic.id}
              </button>
            </>
          )}
          <ChevronRight size={14} />
          <span className={styles.crumbKey}>
            <IssueTypeIcon type={issue.type} size={14} /> {issue.id}
          </span>
        </nav>
        <div className={styles.headerActions}>
          <Button variant="subtle" icon={<Link2 size={18} />} aria-label="Copy link" title="Copy link" onClick={copyLink} />
          <Button variant="subtle" icon={<MoreHorizontal size={18} />} aria-label="More actions" {...more.triggerProps} />
          <Button variant="subtle" icon={<X size={18} />} aria-label="Close" onClick={onClose} />
        </div>
        {more.anchor && (
          <Popover anchor={more.anchor} onClose={more.close} align="end">
            <Menu>
              <MenuItem icon={<Link2 size={16} />} label="Copy link" onClick={() => {
                  more.close()
                  copyLink()
                }} />
              <MenuItem icon={<Trash2 size={16} />} label="Delete issue" danger onClick={remove} />
            </Menu>
          </Popover>
        )}
      </header>

      <div className={`${styles.main} scroller`}>
        <EditableTitle value={issue.title} onSave={title => updateIssue(issue.id, { title })} />

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Description</h3>
          <Description value={issue.description} onSave={description => updateIssue(issue.id, { description })} />
        </section>

        {children && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Child issues</h3>
            {children.length ? (
              <ul className={styles.children}>
                {children.map(child => {
                  const status = project.statuses.find(s => s.id === child.statusId)
                  return (
                    <li key={child.id}>
                      <button type="button" onClick={() => openIssue(child.id)}>
                        <IssueTypeIcon type={child.type} />
                        <span className={styles.childKey}>{child.id}</span>
                        <span className={styles.childTitle}>{child.title}</span>
                        <span className={styles.childStatus}>{status?.name}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className={styles.muted}>No issues in this epic yet. Set the Epic field on an issue to add it.</p>
            )}
          </section>
        )}

        <Checklist issue={issue} />

        <section className={styles.section}>
          <div className={styles.tabs} role="tablist">
            <h3 className={styles.sectionTitle}>Activity</h3>
            {(["comments", "history"] as const).map(t => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={classNames(styles.tab, tab === t && styles.tabActive)}
                onClick={() => setTab(t)}
              >
                {t === "comments" ? `Comments${issue.comments.length ? ` (${issue.comments.length})` : ""}` : "History"}
              </button>
            ))}
          </div>
          {tab === "comments" ? <Comments issue={issue} /> : <History issue={issue} project={project} />}
        </section>
      </div>

      <aside className={`${styles.side} scroller`}>
        <StatusSelect
          statuses={project.statuses}
          value={issue.statusId}
          onChange={statusId => moveIssue(issue.id, statusId)}
        />
        <DetailsPanel issue={issue} project={project} />
      </aside>
    </div>
  )
}

export default IssueDetail
