"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ColorPicker, IconPicker, PROJECT_COLORS, PROJECT_ICONS, suggestKey, validateKey } from "@/components/ProjectFields"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { toast } from "@/components/ui/Toasts"
import { useStore } from "@/store"
import styles from "./Projects.module.sass"
import { projectHref } from "@/lib/routes"

const CreateProjectModal = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter()
  const projects = useStore(s => s.projects)
  const createProject = useStore(s => s.createProject)
  const createSprint = useStore(s => s.createSprint)
  const [name, setName] = useState("")
  const [key, setKey] = useState("")
  const [keyEdited, setKeyEdited] = useState(false)
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState(PROJECT_ICONS[projects.length % PROJECT_ICONS.length])
  const [color, setColor] = useState(PROJECT_COLORS[(projects.length + 4) % PROJECT_COLORS.length])
  const [touched, setTouched] = useState(false)

  const finalKey = keyEdited ? key : suggestKey(name)
  const keyError = validateKey(finalKey, projects)
  const nameError = name.trim() ? null : "Name is required"

  const submit = () => {
    setTouched(true)
    if (keyError || nameError) return
    const project = createProject({ name, key: finalKey, icon, color, description: description.trim() })
    createSprint(project.id)
    toast(`${project.name} created`, "success")
    onClose()
    router.push(projectHref(project.key, "backlog"))
  }

  return (
    <Modal
      onSubmit={submit}
      title="Create project"
      onClose={onClose}
      width={560}
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create project
          </Button>
        </>
      }
    >
      <div
        className={styles.form}
      >
        <div className={styles.formRow}>
          <label className={styles.field}>
            <span>
              Name <em>*</em>
            </span>
            <input
              autoFocus
              value={name}
              maxLength={60}
              placeholder="e.g. Website Redesign"
              aria-invalid={touched && !!nameError}
              onChange={e => setName(e.target.value)}
            />
            {touched && nameError && <small>{nameError}</small>}
          </label>
          <label className={styles.field}>
            <span>
              Key <em>*</em>
            </span>
            <input
              value={finalKey}
              maxLength={6}
              placeholder="WEB"
              aria-invalid={(touched || keyEdited) && !!keyError}
              onChange={e => {
                setKeyEdited(true)
                setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
              }}
            />
            {(touched || keyEdited) && keyError ? <small>{keyError}</small> : <i>Issues: {finalKey || "KEY"}-1, -2…</i>}
          </label>
        </div>
        <label className={styles.field}>
          <span>Description</span>
          <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this project about?" />
        </label>
        <div className={styles.field}>
          <span>Icon</span>
          <IconPicker value={icon} onChange={setIcon} />
        </div>
        <div className={styles.field}>
          <span>Color</span>
          <ColorPicker value={color} onChange={setColor} />
        </div>
      </div>
    </Modal>
  )
}

export default CreateProjectModal
