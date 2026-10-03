"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { projectHref } from "@/lib/routes"
import { useStore } from "@/store"

// Open the first project's board (projects live in this browser), or the project list if there are none
const Home = () => {
  const router = useRouter()
  const first = useStore(s => s.projects[0]?.key)

  useEffect(() => {
    router.replace(first ? projectHref(first) : "/projects")
  }, [first, router])

  return null
}

export default Home
