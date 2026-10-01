"use client"

import PageHeader, { ProjectNotFound } from "@/components/PageHeader"
import { useProject } from "@/hooks/useProject"

const ReportsView = () => {
  const project = useProject()
  if (!project) return <ProjectNotFound />
  return <PageHeader project={project} title="Reports" subtitle="Coming up next." />
}

export default ReportsView
