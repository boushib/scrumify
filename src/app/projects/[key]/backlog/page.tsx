import type { Metadata } from "next"
import BacklogView from "@/views/Backlog"

export const metadata: Metadata = { title: "Backlog | Scrumify" }

const BacklogPage = () => <BacklogView />

export default BacklogPage
