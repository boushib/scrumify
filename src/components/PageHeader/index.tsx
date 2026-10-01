import Link from "next/link"
import type { Project } from "@/models"
import styles from "./PageHeader.module.sass"

interface Props {
  project?: Project
  title: string
  subtitle?: React.ReactNode
  actions?: React.ReactNode
}

const PageHeader = ({ project, title, subtitle, actions }: Props) => (
  <header className={styles.header}>
    <div className={styles.text}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/projects">Projects</Link>
        {project && (
          <>
            <span>/</span>
            <Link href={`/projects/${project.key}/board`}>{project.name}</Link>
          </>
        )}
      </nav>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
    </div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </header>
)

export default PageHeader

export const ProjectNotFound = () => (
  <div className={styles.notFound}>
    <h2>Project not found</h2>
    <p>It may have been removed, or the link is wrong.</p>
    <Link href="/projects">View all projects</Link>
  </div>
)
