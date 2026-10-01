"use client"

import { useEffect } from "react"
import Toasts from "@/components/ui/Toasts"
import { useIsClient } from "@/hooks/useIsClient"
import { useStore } from "@/store"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import styles from "./layout.module.sass"

const Loading = () => (
  <div className={styles.loading}>
    <span className={styles.loadingLogo}>Scrumify</span>
  </div>
)

/** Everything lives in localStorage, so the app mounts in the browser only */
const AppShell = ({ children }: { children: React.ReactNode }) => {
  const isClient = useIsClient()
  const theme = useStore(s => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  if (!isClient) return <Loading />

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content}>{children}</main>
      </div>
      <Toasts />
    </div>
  )
}

export default AppShell
