"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Select from "@/components/ui/Select"
import { toast } from "@/components/ui/Toasts"
import type { Project, Sprint } from "@/models"
import { useStore } from "@/store"
import { isDone } from "@/store/selectors"
import styles from "./Backlog.module.sass"

const DAY = 24 * 60 * 60 * 1000
const DURATIONS = [
  { value: "1", label: "1 week" },
  { value: "2", label: "2 weeks" },
  { value: "3", label: "3 weeks" },
  { value: "4", label: "4 weeks" },
  { value: "custom", label: "Custom" },
]

/** yyyy-mm-dd in local time */
const toInput = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
const fromInput = (value: string) => {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d).getTime()
}
const today = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

interface SprintFormProps {
  sprint: Sprint
  /** "start" starts a planned sprint; "edit" only saves changes */
  mode: "start" | "edit"
  issueCount: number
  onClose: () => void
}

/** Start a sprint, or edit its name, dates and goal */
export const SprintFormModal = ({ sprint, mode, issueCount, onClose }: SprintFormProps) => {
  const startSprint = useStore(s => s.startSprint)
  const updateSprint = useStore(s => s.updateSprint)
  const [name, setName] = useState(sprint.name)
  const [goal, setGoal] = useState(sprint.goal)
  const [start, setStart] = useState(toInput(sprint.startDate ?? today()))
  const initialWeeks =
    sprint.startDate && sprint.endDate ? String(Math.round((sprint.endDate - sprint.startDate) / (7 * DAY))) : "2"
  const [duration, setDuration] = useState(["1", "2", "3", "4"].includes(initialWeeks) ? initialWeeks : "custom")
  const [end, setEnd] = useState(toInput(sprint.endDate ?? today() + 14 * DAY))

  const endValue = duration === "custom" ? end : toInput(fromInput(start) + Number(duration) * 7 * DAY)
  const invalid = !name.trim() || fromInput(endValue) <= fromInput(start)

  const submit = () => {
    if (invalid) return
    const startDate = fromInput(start)
    const endDate = fromInput(endValue)
    updateSprint(sprint.id, { name: name.trim(), goal: goal.trim(), startDate, endDate })
    if (mode === "start") {
      startSprint(sprint.id, startDate, endDate, goal.trim())
      toast(`${name.trim()} started`, "success")
    }
    onClose()
  }

  return (
    <Modal
      title={mode === "start" ? "Start sprint" : "Edit sprint"}
      onClose={onClose}
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={invalid} onClick={submit}>
            {mode === "start" ? "Start" : "Update"}
          </Button>
        </>
      }
    >
      <form
        className={styles.form}
        onSubmit={e => {
          e.preventDefault()
          submit()
        }}
      >
        {mode === "start" && (
          <p className={styles.formIntro}>
            <strong>{issueCount}</strong> {issueCount === 1 ? "issue" : "issues"} will be included in this sprint.
          </p>
        )}
        <label className={styles.formField}>
          <span>Sprint name</span>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} maxLength={60} />
        </label>
        <div className={styles.formRow}>
          <label className={styles.formField}>
            <span>Duration</span>
            <Select label="Duration" value={duration} onChange={setDuration} options={DURATIONS} />
          </label>
          <label className={styles.formField}>
            <span>Start date</span>
            <input type="date" value={start} onChange={e => e.target.value && setStart(e.target.value)} />
          </label>
          <label className={styles.formField}>
            <span>End date</span>
            <input
              type="date"
              value={endValue}
              disabled={duration !== "custom"}
              onChange={e => e.target.value && setEnd(e.target.value)}
            />
          </label>
        </div>
        {fromInput(endValue) <= fromInput(start) && <small className={styles.formError}>End date must be after the start.</small>}
        <label className={styles.formField}>
          <span>Sprint goal</span>
          <textarea rows={3} value={goal} onChange={e => setGoal(e.target.value)} placeholder="What should this sprint achieve?" />
        </label>
        {/* Lets Enter submit; the visible buttons sit in the modal footer, outside the form */}
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden />
      </form>
    </Modal>
  )
}

interface CompleteProps {
  sprint: Sprint
  project: Project
  onClose: () => void
}

export const CompleteSprintModal = ({ sprint, project, onClose }: CompleteProps) => {
  const issues = useStore(s => s.issues)
  const sprints = useStore(s => s.sprints)
  const completeSprint = useStore(s => s.completeSprint)
  const createSprint = useStore(s => s.createSprint)
  const inSprint = Object.values(issues).filter(i => i.sprintId === sprint.id)
  const done = inSprint.filter(i => isDone(project, i))
  const open = inSprint.length - done.length
  const planned = sprints.filter(s => s.projectId === project.id && s.state === "planned")
  const [moveTo, setMoveTo] = useState(planned[0]?.id ?? "backlog")

  const submit = () => {
    let target: string | null = moveTo === "backlog" ? null : moveTo
    if (moveTo === "new") target = createSprint(project.id).id
    completeSprint(sprint.id, target)
    toast(`${sprint.name} completed`, "success")
    onClose()
  }

  return (
    <Modal
      title={`Complete ${sprint.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            Complete sprint
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.completeStats}>
          <div>
            <strong>{done.length}</strong>
            <span>completed {done.length === 1 ? "issue" : "issues"}</span>
          </div>
          <div>
            <strong>{open}</strong>
            <span>open {open === 1 ? "issue" : "issues"}</span>
          </div>
        </div>
        {open > 0 ? (
          <label className={styles.formField}>
            <span>Move open issues to</span>
            <Select
              label="Move open issues to"
              value={moveTo}
              onChange={setMoveTo}
              options={[
                ...planned.map(s => ({ value: s.id, label: s.name })),
                { value: "new", label: "New sprint" },
                { value: "backlog", label: "Backlog" },
              ]}
            />
          </label>
        ) : (
          <p className={styles.formIntro}>Every issue in this sprint is done. Nice work!</p>
        )}
      </div>
    </Modal>
  )
}

export const DeleteSprintModal = ({ sprint, issueCount, onClose }: { sprint: Sprint; issueCount: number; onClose: () => void }) => {
  const deleteSprint = useStore(s => s.deleteSprint)
  return (
    <Modal
      title={`Delete ${sprint.name}?`}
      onClose={onClose}
      width={460}
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteSprint(sprint.id)
              toast(`${sprint.name} deleted`, "info")
              onClose()
            }}
          >
            Delete sprint
          </Button>
        </>
      }
    >
      <p className={styles.formIntro}>
        {issueCount
          ? `Its ${issueCount} ${issueCount === 1 ? "issue moves" : "issues move"} to the backlog. This can’t be undone.`
          : "The sprint is empty. This can’t be undone."}
      </p>
    </Modal>
  )
}
