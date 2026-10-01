"use client"

import PageHeader, { ProjectNotFound } from "@/components/PageHeader"
import { useProject } from "@/hooks/useProject"

const SettingsView = () => {
  const project = useProject()
  if (!project) return <ProjectNotFound />
  return <PageHeader project={project} title="Project settings" subtitle="Coming up next." />
}

export default SettingsView
