"use client"

import { usePathname } from "next/navigation"
import { Suspense, useEffect } from "react"
import CommandPalette from "@/components/CommandPalette"
import CreateIssueModal from "@/components/CreateIssueModal"
import IssueModalHost from "@/components/IssueModal"
import Shortcuts from "@/components/Shortcuts"
import Toasts from "@/components/ui/Toasts"
import { useIsClient } from "@/hooks/useIsClient"
import { useStore } from "@/store"
import { useUi } from "@/store/ui"
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
  const pathname = usePathname()
  const theme = useStore(s => s.theme)
  const navOpen = useUi(s => s.navOpen)
  const setNavOpen = useUi(s => s.setNavOpen)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  if (!isClient) return <Loading />

  return (
    <div className={styles.shell}>
      <Sidebar />
      {navOpen && <div className={styles.scrim} onClick={() => setNavOpen(false)} aria-hidden />}
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content}>
          {/* Keyed by route so each page fades in */}
          <div key={pathname} className={styles.page}>
            {children}
          </div>
        </main>
      </div>
      <Suspense>
        <IssueModalHost />
        <CreateIssueModal />
        <CommandPalette />
        <Shortcuts />
      </Suspense>
      <Toasts />
    </div>
  )
}

export default AppShell
