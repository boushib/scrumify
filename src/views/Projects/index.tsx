"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import PageHeader from "@/components/PageHeader"
import { ProjectAvatar } from "@/components/ProjectFields"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import { useStore } from "@/store"
import { activeSprintOf, isDone, issuesOf } from "@/store/selectors"
import CreateProjectModal from "./CreateProjectModal"
import styles from "./Projects.module.sass"

const ProjectsView = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projects = useStore(s => s.projects)
  const users = useStore(s => s.users)
  const issues = useStore(s => s.issues)
  const sprints = useStore(s => s.sprints)
  // The modal lives in the URL so the sidebar's "Create project" can open it from anywhere
  const creating = searchParams.get("new") === "1"

  return (
    <div className={`${styles.page} scroller`}>
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} ${projects.length === 1 ? "project" : "projects"} in this workspace`}
        actions={
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => router.push("/projects?new=1")}>
            Create project
          </Button>
        }
      />
      <div className={styles.grid}>
        {projects.map(project => {
          const lead = users.find(u => u.id === project.leadId)
          const list = issuesOf(issues, project.id).filter(i => i.type !== "epic")
          const open = list.filter(i => !isDone(project, i)).length
          const sprint = activeSprintOf(sprints, project.id)
          const inSprint = sprint ? list.filter(i => i.sprintId === sprint.id) : []
          const progress = inSprint.length
            ? Math.round((inSprint.filter(i => isDone(project, i)).length / inSprint.length) * 100)
            : null
          return (
            <Link key={project.id} href={`/projects/${project.key}/board`} className={styles.card}>
              <div className={styles.cardTop}>
                <ProjectAvatar icon={project.icon} color={project.color} />
                <div className={styles.text}>
                  <h2>{project.name}</h2>
                  <span className={styles.key}>{project.key} · Scrum</span>
                </div>
              </div>
              {project.description && <p className={styles.description}>{project.description}</p>}
              <div className={styles.sprintLine}>
                {sprint ? (
                  <>
                    <span>{sprint.name}</span>
                    <span className={styles.progress}>
                      <span style={{ width: `${progress ?? 0}%` }} />
                    </span>
                    <span>{progress ?? 0}%</span>
                  </>
                ) : (
                  <span className={styles.muted}>No active sprint</span>
                )}
              </div>
              <footer className={styles.footer}>
                <span>
                  {open} open {open === 1 ? "issue" : "issues"}
                </span>
                <Avatar user={lead} size={22} title={lead ? `Lead: ${lead.name}` : undefined} />
              </footer>
            </Link>
          )
        })}
        <button type="button" className={styles.newCard} onClick={() => router.push("/projects?new=1")}>
          <Plus size={22} />
          Create project
        </button>
      </div>
      {creating && <CreateProjectModal onClose={() => router.replace("/projects")} />}
    </div>
  )
}

export default ProjectsView
