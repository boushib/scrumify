"use client"

import { useParams } from "next/navigation"
import { useStore } from "@/store"
import { projectByKey } from "@/store/selectors"

/** The project for the current /projects/[key] route */
export const useProject = () => {
  const { key } = useParams<{ key?: string }>()
  return useStore(s => (key ? projectByKey(s.projects, decodeURIComponent(key)) : undefined))
}
