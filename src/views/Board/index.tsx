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
import Link from "next/link"
import { useMemo, useState } from "react"
import IssueCard from "@/components/IssueCard"
import IssueFilters, { applyFilters, EMPTY_FILTERS, type Filters } from "@/components/IssueFilters"
import { useOpenIssue } from "@/components/IssueModal"
import PageHeader, { ProjectNotFound } from "@/components/PageHeader"
import { useNow } from "@/hooks/useNow"
import { useProject } from "@/hooks/useProject"
import { formatShortDate } from "@/lib/format"
import type { Issue } from "@/models"
import { useStore } from "@/store"
import { activeSprintOf, byRank, issuesOf } from "@/store/selectors"
import BoardColumn from "./BoardColumn"
import styles from "./Board.module.sass"
import { projectHref } from "@/lib/routes"

type Columns = Record<string, string[]>

const DAY = 24 * 60 * 60 * 1000

const describeDaysLeft = (days: number) =>
  days > 1 ? `${days} days left` : days === 1 ? "1 day left" : days === 0 ? "ends today" : "overdue"

const BoardView = () => {
  const project = useProject()
  const openIssue = useOpenIssue()
  const sprints = useStore(s => s.sprints)
  const allIssues = useStore(s => s.issues)
  const moveIssue = useStore(s => s.moveIssue)
  const now = useNow()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  // While dragging, columns live in local state so a card can hop between them
  const [dragColumns, setDragColumns] = useState<Columns | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sprint = project ? activeSprintOf(sprints, project.id) : undefined
  const sprintIssues = useMemo(
    () =>
      project && sprint
        ? issuesOf(allIssues, project.id).filter(i => i.type !== "epic" && i.sprintId === sprint.id)
        : [],
    [allIssues, project, sprint]
  )
  const visible = useMemo(() => applyFilters(sprintIssues, filters), [sprintIssues, filters])

  const baseColumns = useMemo<Columns>(() => {
    const columns: Columns = {}
    for (const status of project?.statuses ?? []) {
      columns[status.id] = visible
        .filter(i => i.statusId === status.id)
        .sort(byRank)
        .map(i => i.id)
    }
    return columns
  }, [project, visible])

  if (!project) return <ProjectNotFound />

  const columns = dragColumns ?? baseColumns
  const findColumn = (id: string) =>
    id in columns ? id : Object.keys(columns).find(key => columns[key].includes(id))

  const resetDrag = () => {
    setActiveId(null)
    setDragColumns(null)
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id))
    setDragColumns(baseColumns)
  }

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const id = String(active.id)
    const from = findColumn(id)
    const to = findColumn(String(over.id))
    if (!from || !to || from === to) return
    setDragColumns(current => {
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
    const column = findColumn(id)
    if (over && column) {
      let list = columns[column]
      const overIndex = list.indexOf(String(over.id))
      const activeIndex = list.indexOf(id)
      if (overIndex >= 0 && overIndex !== activeIndex) list = arrayMove(list, activeIndex, overIndex)
      const index = list.indexOf(id)
      const changed = allIssues[id].statusId !== column || baseColumns[column].indexOf(id) !== index
      if (changed) moveIssue(id, column, list[index - 1], list[index + 1])
    }
    resetDrag()
  }

  const daysLeft = sprint?.endDate ? Math.ceil((sprint.endDate - now) / DAY) : null

  return (
    <div className={styles.page}>
      <PageHeader
        project={project}
        title={sprint ? sprint.name : "Board"}
        subtitle={
          sprint && (
            <>
              {sprint.goal && <span className={styles.goal}>{sprint.goal}</span>}
              {sprint.startDate && sprint.endDate && (
                <span>
                  {formatShortDate(sprint.startDate)} – {formatShortDate(sprint.endDate)}
                  {daysLeft !== null && ` · ${describeDaysLeft(daysLeft)}`}
                </span>
              )}
            </>
          )
        }
      />

      {!sprint ? (
        <div className={styles.empty}>
          <h2>No active sprint</h2>
          <p>Plan a sprint in the backlog and start it to see its issues on the board.</p>
          <Link href={projectHref(project.key, "backlog")}>Go to backlog</Link>
        </div>
      ) : (
        <>
          <IssueFilters issues={sprintIssues} filters={filters} onChange={setFilters} placeholder="Search this board" />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={resetDrag}
          >
            <div className={`${styles.columns} scroller`}>
              {project.statuses.map(status => (
                <BoardColumn
                  key={status.id}
                  project={project}
                  sprintId={sprint.id}
                  status={status}
                  issues={columns[status.id].map(id => allIssues[id]).filter((i): i is Issue => !!i)}
                  total={sprintIssues.filter(i => i.statusId === status.id).length}
                  onOpen={openIssue}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(.2,.9,.3,1)" }}>
              {activeId && allIssues[activeId] ? <IssueCard issue={allIssues[activeId]} dragging /> : null}
            </DragOverlay>
          </DndContext>
        </>
      )}
    </div>
  )
}

export default BoardView
