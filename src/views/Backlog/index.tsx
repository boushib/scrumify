"use client"

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useMemo, useState } from "react"
import IssueFilters, { applyFilters, EMPTY_FILTERS, type Filters } from "@/components/IssueFilters"
import { useOpenIssue } from "@/components/IssueModal"
import PageHeader, { ProjectNotFound } from "@/components/PageHeader"
import Button from "@/components/ui/Button"
import { toast } from "@/components/ui/Toasts"
import { useProject } from "@/hooks/useProject"
import type { Issue, Sprint } from "@/models"
import { useStore } from "@/store"
import { byRank, issuesOf } from "@/store/selectors"
import { IssueRowContent } from "./IssueRow"
import { CompleteSprintModal, DeleteSprintModal, SprintFormModal } from "./SprintModals"
import SprintSection, { BACKLOG } from "./SprintSection"
import styles from "./Backlog.module.sass"

type Lists = Record<string, string[]>
type Dialog = { kind: "start" | "edit" | "complete" | "delete"; sprint: Sprint } | null

const BacklogView = () => {
  const project = useProject()
  const allSprints = useStore(s => s.sprints)
  const allIssues = useStore(s => s.issues)
  const planIssue = useStore(s => s.planIssue)
  const createSprint = useStore(s => s.createSprint)
  const openIssue = useOpenIssue()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [dragLists, setDragLists] = useState<Lists | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Active sprint first, then planned sprints in the order they were created
  const sprints = useMemo(
    () =>
      project
        ? allSprints
            .filter(s => s.projectId === project.id && s.state !== "completed")
            .sort((a, b) => Number(b.state === "active") - Number(a.state === "active"))
        : [],
    [allSprints, project]
  )
  const work = useMemo(
    () => (project ? issuesOf(allIssues, project.id).filter(i => i.type !== "epic") : []),
    [allIssues, project]
  )
  const visible = useMemo(() => applyFilters(work, filters), [work, filters])

  const baseLists = useMemo<Lists>(() => {
    const lists: Lists = {}
    for (const key of [...sprints.map(s => s.id), BACKLOG]) {
      const sprintId = key === BACKLOG ? null : key
      lists[key] = visible
        .filter(i => i.sprintId === sprintId)
        .sort(byRank)
        .map(i => i.id)
    }
    return lists
  }, [sprints, visible])

  if (!project) return <ProjectNotFound />

  const lists = dragLists ?? baseLists
  const findList = (id: string) => (id in lists ? id : Object.keys(lists).find(key => lists[key].includes(id)))
  const hasActive = sprints.some(s => s.state === "active")
  const issuesIn = (sprintId: string | null) => work.filter(i => i.sprintId === sprintId)
  const toIssues = (ids: string[]) => ids.map(id => allIssues[id]).filter((i): i is Issue => !!i)

  const resetDrag = () => {
    setActiveId(null)
    setDragLists(null)
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id))
    setDragLists(baseLists)
  }

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const id = String(active.id)
    const from = findList(id)
    const to = findList(String(over.id))
    if (!from || !to || from === to) return
    setDragLists(current => {
      if (!current) return current
      const target = current[to].filter(x => x !== id)
      const overIndex = target.indexOf(String(over.id))
      const index = overIndex >= 0 ? overIndex : target.length
      return {
        ...current,
        [from]: current[from].filter(x => x !== id),
        [to]: [...target.slice(0, index), id, ...target.slice(index)],
      }
    })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const id = String(active.id)
    const key = findList(id)
    if (over && key) {
      let list = lists[key]
      const overIndex = list.indexOf(String(over.id))
      const activeIndex = list.indexOf(id)
      if (overIndex >= 0 && overIndex !== activeIndex) list = arrayMove(list, activeIndex, overIndex)
      const index = list.indexOf(id)
      const sprintId = key === BACKLOG ? null : key
      const changed = allIssues[id].sprintId !== sprintId || baseLists[key].indexOf(id) !== index
      if (changed) planIssue(id, sprintId, list[index - 1], list[index + 1])
    }
    resetDrag()
  }

  const newSprint = () => {
    const sprint = createSprint(project.id)
    toast(`${sprint.name} created`, "success")
  }

  return (
    <div className={styles.page}>
      <PageHeader
        project={project}
        title="Backlog"
        actions={
          <Button variant="primary" onClick={newSprint}>
            Create sprint
          </Button>
        }
      />
      <IssueFilters issues={work} filters={filters} onChange={setFilters} placeholder="Search backlog" />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={resetDrag}
      >
        <div className={`${styles.sections} scroller`}>
          {sprints.map(sprint => (
            <SprintSection
              key={sprint.id}
              project={project}
              sprint={sprint}
              issues={toIssues(lists[sprint.id])}
              allIssues={issuesIn(sprint.id)}
              canStart={!hasActive}
              onOpen={openIssue}
              onStart={() => setDialog({ kind: "start", sprint })}
              onComplete={() => setDialog({ kind: "complete", sprint })}
              onEdit={() => setDialog({ kind: "edit", sprint })}
              onDelete={() => setDialog({ kind: "delete", sprint })}
            />
          ))}
          <SprintSection
            project={project}
            sprint={null}
            issues={toIssues(lists[BACKLOG])}
            allIssues={issuesIn(null)}
            canStart={false}
            onOpen={openIssue}
            onCreateSprint={newSprint}
          />
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(.2,.9,.3,1)" }}>
          {activeId && allIssues[activeId] ? <IssueRowContent issue={allIssues[activeId]} project={project} overlay /> : null}
        </DragOverlay>
      </DndContext>

      {dialog && (dialog.kind === "start" || dialog.kind === "edit") && (
        <SprintFormModal
          sprint={dialog.sprint}
          mode={dialog.kind}
          issueCount={issuesIn(dialog.sprint.id).length}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "complete" && (
        <CompleteSprintModal sprint={dialog.sprint} project={project} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === "delete" && (
        <DeleteSprintModal
          sprint={dialog.sprint}
          issueCount={issuesIn(dialog.sprint.id).length}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}

export default BacklogView
