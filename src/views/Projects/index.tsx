"use client"

import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import Avatar from "@/components/ui/Avatar"
import { useStore } from "@/store"
import { issuesOf } from "@/store/selectors"
import styles from "./Projects.module.sass"

const ProjectsView = () => {
  const projects = useStore(s => s.projects)
  const users = useStore(s => s.users)
  const issues = useStore(s => s.issues)

  return (
    <div>
      <PageHeader title="Projects" subtitle={`${projects.length} projects in this workspace`} />
      <div className={styles.grid}>
        {projects.map(project => {
          const lead = users.find(u => u.id === project.leadId)
          const count = issuesOf(issues, project.id).length
          return (
            <Link key={project.id} href={`/projects/${project.key}/board`} className={styles.card}>
              <span className={styles.icon} style={{ backgroundColor: project.color }}>
                {project.icon}
              </span>
              <div className={styles.text}>
                <h2>{project.name}</h2>
                <p>{project.description}</p>
              </div>
              <footer className={styles.footer}>
                <span className={styles.key}>{project.key}</span>
                <span>{count} issues</span>
                <Avatar user={lead} size={22} />
              </footer>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ProjectsView
