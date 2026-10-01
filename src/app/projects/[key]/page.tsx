import { redirect } from "next/navigation"

const ProjectPage = async ({ params }: PageProps<"/projects/[key]">) => {
  const { key } = await params
  redirect(`/projects/${key}/board`)
}

export default ProjectPage
