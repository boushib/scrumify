"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import Modal from "@/components/ui/Modal"
import { useStore } from "@/store"
import IssueDetail from "./IssueDetail"
import styles from "./IssueModal.module.sass"

/** Shows the issue named by the ?issue= search param, from any page */
const IssueModalHost = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const issueId = searchParams.get("issue")
  const issue = useStore(s => (issueId ? s.issues[issueId] : undefined))

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("issue")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  if (!issueId) return null

  if (!issue) {
    return (
      <Modal title="Issue not found" onClose={close}>
        <p className={styles.notFound}>
          <strong>{issueId}</strong> doesn’t exist. It may have been deleted.
        </p>
      </Modal>
    )
  }

  return (
    <Modal label={`${issue.id}: ${issue.title}`} onClose={close} width={1080} bodyClassName={styles.body}>
      <IssueDetail key={issue.id} issue={issue} onClose={close} />
    </Modal>
  )
}

export default IssueModalHost

/** Link target that opens an issue on the current page */
export const useOpenIssue = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  return useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("issue", id)
      router.push(`${pathname}?${params}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )
}
