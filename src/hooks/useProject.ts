"use client"

import { useSearchParams } from "next/navigation"
import { useStore } from "@/store"
import { projectByKey } from "@/store/selectors"

/** The project named in ?project= */
export const useProject = () => {
  const key = useSearchParams().get("project")
  return useStore(s => (key ? projectByKey(s.projects, key) : undefined))
}
