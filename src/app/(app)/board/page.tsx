import type { Metadata } from "next"
import { Suspense } from "react"
import BoardView from "@/views/Board"

export const metadata: Metadata = { title: "Board | Scrumify" }

// The board reads search params (the open issue), so it needs a Suspense boundary
const BoardPage = () => (
  <Suspense>
    <BoardView />
  </Suspense>
)

export default BoardPage
