import type { Metadata } from "next"
import { Suspense } from "react"
import ProjectsView from "@/views/Projects"

export const metadata: Metadata = { title: "Projects | Scrumify" }

// The create dialog is driven by ?new=1, so the view reads search params
const ProjectsPage = () => (
  <Suspense>
    <ProjectsView />
  </Suspense>
)

export default ProjectsPage
