"use client"

import { useEffect, useState } from "react"
import { useOpenIssue } from "@/components/IssueModal"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import IssueTypeIcon, { ISSUE_TYPES } from "@/components/ui/IssueTypeIcon"
import Modal from "@/components/ui/Modal"
import PriorityIcon, { PRIORITIES } from "@/components/ui/PriorityIcon"
import Select from "@/components/ui/Select"
import { toast } from "@/components/ui/Toasts"
import { useProject } from "@/hooks/useProject"
import type { IssueType, Priority, Project } from "@/models"
import { useStore } from "@/store"
import { activeSprintOf } from "@/store/selectors"
import styles from "./CreateIssueModal.module.sass"

const POINTS = ["1", "2", "3", "5", "8", "13", "21"]

/** True while the user is typing somewhere, so single-key shortcuts stay out of the way */
export const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
}

interface FormProps {
  initialProject: Project
  onClose: () => void
}

const CreateIssueForm = ({ initialProject, onClose }: FormProps) => {
  const projects = useStore(s => s.projects)
  const users = useStore(s => s.users)
  const sprints = useStore(s => s.sprints)
  const issues = useStore(s => s.issues)
  const createIssue = useStore(s => s.createIssue)
  const openIssue = useOpenIssue()

  const [projectId, setProjectId] = useState(initialProject.id)
  const project = projects.find(p => p.id === projectId) ?? initialProject
  const [type, setType] = useState<IssueType>("story")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState("none")
  const [priority, setPriority] = useState<Priority>("medium")
  const [points, setPoints] = useState("none")
  const [sprintId, setSprintId] = useState(() => activeSprintOf(sprints, initialProject.id)?.id ?? "backlog")
  const [epicId, setEpicId] = useState("none")
  const [another, setAnother] = useState(false)
  const [touched, setTouched] = useState(false)

  const projectSprints = sprints.filter(s => s.projectId === project.id && s.state !== "completed")
  const epics = Object.values(issues).filter(i => i.projectId === project.id && i.type === "epic")
  const isEpic = type === "epic"

  const changeProject = (id: string) => {
    setProjectId(id)
    setSprintId(activeSprintOf(sprints, id)?.id ?? "backlog")
    setEpicId("none")
  }

  const submit = () => {
    setTouched(true)
    if (!title.trim()) return
    const issue = createIssue({
      projectId: project.id,
      type,
      title,
      description: description.trim(),
      assigneeId: assigneeId === "none" ? null : assigneeId,
      priority,
      points: isEpic || points === "none" ? null : Number(points),
      sprintId: isEpic || sprintId === "backlog" ? null : sprintId,
      epicId: isEpic || epicId === "none" ? null : epicId,
    })
    toast(`${issue.id} created`, "success", { label: "View", onClick: () => openIssue(issue.id) })
    if (another) {
      setTitle("")
      setDescription("")
      setTouched(false)
    } else {
      onClose()
    }
  }

  return (
    <Modal
      onSubmit={submit}
      title="Create issue"
      onClose={onClose}
      width={620}
      footer={
        <>
          <label className={styles.another}>
            <input type="checkbox" checked={another} onChange={e => setAnother(e.target.checked)} />
            Create another
          </label>
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create
          </Button>
        </>
      }
    >
      <div
        className={styles.form}
        onKeyDown={e => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit()
        }}
      >
        <div className={styles.row}>
          <label className={styles.field}>
            <span>Project</span>
            <Select
              label="Project"
              value={project.id}
              onChange={changeProject}
              options={projects.map(p => ({
                value: p.id,
                label: `${p.name} (${p.key})`,
                icon: <span className={styles.projectIcon}>{p.icon}</span>,
              }))}
            />
          </label>
          <label className={styles.field}>
            <span>Issue type</span>
            <Select<IssueType>
              label="Issue type"
              value={type}
              onChange={setType}
              options={ISSUE_TYPES.map(t => ({ value: t.type, label: t.label, icon: <IssueTypeIcon type={t.type} /> }))}
            />
          </label>
        </div>

        <label className={styles.field}>
          <span>
            Summary <em>*</em>
          </span>
          <input
            autoFocus
            className={styles.input}
            value={title}
            maxLength={200}
            aria-invalid={touched && !title.trim()}
            placeholder="What needs to be done?"
            onChange={e => setTitle(e.target.value)}
          />
          {touched && !title.trim() && <small className={styles.error}>Summary is required</small>}
        </label>

        <label className={styles.field}>
          <span>Description</span>
          <textarea
            className={styles.input}
            rows={5}
            value={description}
            placeholder="Markdown works: **bold**, - lists, `code`, [links](https://…)"
            onChange={e => setDescription(e.target.value)}
          />
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Assignee</span>
            <Select
              label="Assignee"
              value={assigneeId}
              onChange={setAssigneeId}
              options={[
                { value: "none", label: "Unassigned", icon: <Avatar size={20} /> },
                ...users.map(u => ({ value: u.id, label: u.name, icon: <Avatar user={u} size={20} /> })),
              ]}
            />
          </label>
          <label className={styles.field}>
            <span>Priority</span>
            <Select<Priority>
              label="Priority"
              value={priority}
              onChange={setPriority}
              options={PRIORITIES.map(p => ({ value: p.priority, label: p.label, icon: <PriorityIcon priority={p.priority} /> }))}
            />
          </label>
        </div>

        {!isEpic && (
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Sprint</span>
              <Select
                label="Sprint"
                value={sprintId}
                onChange={setSprintId}
                options={[
                  { value: "backlog", label: "Backlog" },
                  ...projectSprints.map(s => ({ value: s.id, label: s.state === "active" ? `${s.name} (active)` : s.name })),
                ]}
              />
            </label>
            <label className={styles.field}>
              <span>Story points</span>
              <Select
                label="Story points"
                value={points}
                onChange={setPoints}
                options={[{ value: "none", label: "None" }, ...POINTS.map(p => ({ value: p, label: p }))]}
              />
            </label>
            <label className={styles.field}>
              <span>Epic</span>
              <Select
                label="Epic"
                value={epicId}
                onChange={setEpicId}
                options={[
                  { value: "none", label: "None" },
                  ...epics.map(e => ({ value: e.id, label: e.title, icon: <IssueTypeIcon type="epic" /> })),
                ]}
              />
            </label>
          </div>
        )}
      </div>
    </Modal>
  )
}

/** Listens for the Create button and the "C" shortcut */
const CreateIssueModal = () => {
  const [open, setOpen] = useState(false)
  const routeProject = useProject()
  const firstProject = useStore(s => s.projects[0])
  const project = routeProject ?? firstProject

  useEffect(() => {
    const show = () => setOpen(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "c" || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      if (document.querySelector("[role=dialog]")) return
      e.preventDefault()
      setOpen(true)
    }
    window.addEventListener("scrumify:create", show)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("scrumify:create", show)
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  if (!open || !project) return null
  return <CreateIssueForm initialProject={project} onClose={() => setOpen(false)} />
}

export default CreateIssueModal
