import type { Metadata } from "next"
import BoardView from "@/views/Board"

export const metadata: Metadata = { title: "Board | Scrumify" }

const BoardPage = () => <BoardView />

export default BoardPage
