"use client"

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import PageHeader, { ProjectNotFound } from "@/components/PageHeader"
import { ColorPicker, IconPicker, ProjectAvatar } from "@/components/ProjectFields"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Select from "@/components/ui/Select"
import { StatusLozenge } from "@/components/ui/StatusSelect"
import { toast } from "@/components/ui/Toasts"
import { useProject } from "@/hooks/useProject"
import { uid } from "@/lib/id"
import type { Project, Status, StatusCategory } from "@/models"
import { useStore } from "@/store"
import styles from "./Settings.module.sass"

const CATEGORIES: { value: StatusCategory; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
]

const Details = ({ project }: { project: Project }) => {
  const users = useStore(s => s.users)
  const updateProject = useStore(s => s.updateProject)
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [icon, setIcon] = useState(project.icon)
  const [color, setColor] = useState(project.color)
  const [leadId, setLeadId] = useState(project.leadId)
  const dirty =
    name !== project.name ||
    description !== project.description ||
    icon !== project.icon ||
    color !== project.color ||
    leadId !== project.leadId

  const save = () => {
    if (!name.trim()) return
    updateProject(project.id, { name: name.trim(), description: description.trim(), icon, color, leadId })
    toast("Project details saved", "success")
  }

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <h2>Details</h2>
        <p>How the project appears across the workspace.</p>
      </header>
      <form
        className={styles.form}
        onSubmit={e => {
          e.preventDefault()
          save()
        }}
      >
        <div className={styles.preview}>
          <ProjectAvatar icon={icon} color={color} size={64} />
          <div>
            <strong>{name || "Untitled project"}</strong>
            <span>{project.key} · Scrum project</span>
          </div>
        </div>
        <label className={styles.field}>
          <span>Name</span>
          <input value={name} maxLength={60} onChange={e => setName(e.target.value)} aria-invalid={!name.trim()} />
        </label>
        <label className={styles.field}>
          <span>Key</span>
          <input value={project.key} disabled />
          <i>The key is part of every issue ID, so it can’t be changed.</i>
        </label>
        <label className={styles.field}>
          <span>Description</span>
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} />
        </label>
        <div className={styles.field}>
          <span>Project lead</span>
          <Select
            label="Project lead"
            value={leadId}
            onChange={setLeadId}
            options={users.map(u => ({ value: u.id, label: u.name, icon: <Avatar user={u} size={20} /> }))}
          />
        </div>
        <div className={styles.field}>
          <span>Icon</span>
          <IconPicker value={icon} onChange={setIcon} />
        </div>
        <div className={styles.field}>
          <span>Color</span>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={!dirty || !name.trim()}>
            Save changes
          </Button>
          {dirty && (
            <Button
              variant="subtle"
              onClick={() => {
                setName(project.name)
                setDescription(project.description)
                setIcon(project.icon)
                setColor(project.color)
                setLeadId(project.leadId)
              }}
            >
              Discard
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}

/** Columns save immediately, like Jira's board settings */
const Columns = ({ project }: { project: Project }) => {
  const issues = useStore(s => s.issues)
  const updateProject = useStore(s => s.updateProject)
  const statuses = project.statuses
  const counts = Object.fromEntries(
    statuses.map(s => [s.id, Object.values(issues).filter(i => i.projectId === project.id && i.statusId === s.id).length])
  )
  const save = (next: Status[]) => updateProject(project.id, { statuses: next })
  const patch = (id: string, change: Partial<Status>) => save(statuses.map(s => (s.id === id ? { ...s, ...change } : s)))
  const move = (index: number, by: number) => {
    const next = [...statuses]
    const [item] = next.splice(index, 1)
    next.splice(index + by, 0, item)
    save(next)
  }
  const countIn = (category: StatusCategory) => statuses.filter(s => s.category === category).length

  // A board needs somewhere to start and somewhere to finish
  const removeBlocker = (status: Status) =>
    counts[status.id]
      ? `Move its ${counts[status.id]} issues first`
      : status.category !== "in_progress" && countIn(status.category) === 1
        ? `The board needs a ${status.category === "todo" ? "To do" : "Done"} column`
        : null

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <h2>Board columns</h2>
        <p>Statuses in board order. The category decides progress and reports; WIP limits warn when a column is overloaded.</p>
      </header>
      <div className={styles.columnsHead}>
        <span>Status</span>
        <span>Category</span>
        <span>WIP limit</span>
        <span>Issues</span>
        <span />
      </div>
      <ul className={styles.columns}>
        {statuses.map((status, index) => {
          const blocker = removeBlocker(status)
          return (
            <li key={status.id} className={styles.columnRow}>
              <span className={styles.columnName}>
                <input
                  defaultValue={status.name}
                  aria-label="Status name"
                  maxLength={30}
                  onBlur={e => {
                    const name = e.target.value.trim()
                    if (name && name !== status.name) patch(status.id, { name })
                    else e.target.value = status.name
                  }}
                  onKeyDown={e => e.key === "Enter" && e.currentTarget.blur()}
                />
                <StatusLozenge status={status} />
              </span>
              <Select<StatusCategory>
                compact
                label="Category"
                value={status.category}
                onChange={category => {
                  if (status.category !== "in_progress" && countIn(status.category) === 1) {
                    toast(`The board needs at least one ${status.category === "todo" ? "To do" : "Done"} column`, "danger")
                    return
                  }
                  patch(status.id, { category })
                }}
                options={CATEGORIES}
              />
              <input
                type="number"
                min={0}
                max={99}
                className={styles.wip}
                value={status.wipLimit || ""}
                placeholder="None"
                aria-label={`WIP limit for ${status.name}`}
                onChange={e => patch(status.id, { wipLimit: Math.max(0, Math.min(99, Number(e.target.value) || 0)) })}
              />
              <span className={styles.columnCount}>{counts[status.id]}</span>
              <span className={styles.columnActions}>
                <Button size="sm" variant="subtle" icon={<ArrowUp size={14} />} aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)} />
                <Button
                  size="sm"
                  variant="subtle"
                  icon={<ArrowDown size={14} />}
                  aria-label="Move down"
                  disabled={index === statuses.length - 1}
                  onClick={() => move(index, 1)}
                />
                <Button
                  size="sm"
                  variant="subtle"
                  icon={<Trash2 size={14} />}
                  aria-label={`Delete ${status.name}`}
                  title={blocker ?? `Delete ${status.name}`}
                  disabled={!!blocker}
                  onClick={() => save(statuses.filter(s => s.id !== status.id))}
                />
              </span>
            </li>
          )
        })}
      </ul>
      <Button
        icon={<Plus size={16} />}
        disabled={statuses.length >= 8}
        onClick={() => {
          // New columns go just before the first Done column
          const at = statuses.findIndex(s => s.category === "done")
          const next = [...statuses]
          next.splice(at < 0 ? next.length : at, 0, { id: uid("st-"), name: "New status", category: "in_progress", wipLimit: 0 })
          save(next)
        }}
      >
        Add column
      </Button>
    </section>
  )
}

const DangerZone = ({ project }: { project: Project }) => {
  const router = useRouter()
  const deleteProject = useStore(s => s.deleteProject)
  const projectCount = useStore(s => s.projects.length)
  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState("")

  return (
    <section className={`${styles.card} ${styles.danger}`}>
      <header className={styles.cardHeader}>
        <h2>Delete project</h2>
        <p>Removes the project with all of its sprints and issues.</p>
      </header>
      <Button
        variant="danger"
        disabled={projectCount <= 1}
        title={projectCount <= 1 ? "The workspace needs at least one project" : undefined}
        onClick={() => setConfirming(true)}
      >
        Delete {project.name}
      </Button>
      {confirming && (
        <Modal
          title={`Delete ${project.name}?`}
          onClose={() => setConfirming(false)}
          width={460}
          footer={
            <>
              <Button variant="subtle" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={typed !== project.key}
                onClick={() => {
                  router.push("/projects")
                  deleteProject(project.id)
                  toast(`${project.name} deleted`, "info")
                }}
              >
                Delete project
              </Button>
            </>
          }
        >
          <div className={styles.form}>
            <p className={styles.warning}>This can’t be undone. Type the project key to confirm.</p>
            <label className={styles.field}>
              <span>Project key</span>
              <input autoFocus value={typed} placeholder={project.key} onChange={e => setTyped(e.target.value.toUpperCase())} />
            </label>
          </div>
        </Modal>
      )}
    </section>
  )
}

const SettingsView = () => {
  const project = useProject()
  if (!project) return <ProjectNotFound />
  return (
    <div className={`${styles.page} scroller`}>
      <PageHeader project={project} title="Project settings" />
      <div className={styles.content}>
        <Details key={project.id} project={project} />
        <Columns project={project} />
        <DangerZone project={project} />
      </div>
    </div>
  )
}

export default SettingsView
