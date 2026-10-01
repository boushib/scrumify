import type { Metadata } from "next"
import ProjectsView from "@/views/Projects"

export const metadata: Metadata = { title: "Projects | Scrumify" }

const ProjectsPage = () => <ProjectsView />

export default ProjectsPage
