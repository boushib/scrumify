"use client"

import PageHeader, { ProjectNotFound } from "@/components/PageHeader"
import { useProject } from "@/hooks/useProject"

const BacklogView = () => {
  const project = useProject()
  if (!project) return <ProjectNotFound />
  return <PageHeader project={project} title="Backlog" subtitle="Coming up next." />
}

export default BacklogView
