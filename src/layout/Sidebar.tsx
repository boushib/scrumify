"use client"

import classNames from "classnames"
import { BarChart3, ChevronsUpDown, Kanban, LayoutGrid, ListTodo, Plus, Settings, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Popover, { Menu, MenuItem, MenuSeparator, usePopover } from "@/components/ui/Popover"
import { useProject } from "@/hooks/useProject"
import { useStore } from "@/store"
import { useUi } from "@/store/ui"
import styles from "./layout.module.sass"
import { projectHref, type ProjectView } from "@/lib/routes"

const NAV: { href: ProjectView; label: string; icon: typeof Kanban }[] = [
  { href: "board", label: "Board", icon: Kanban },
  { href: "backlog", label: "Backlog", icon: ListTodo },
  { href: "reports", label: "Reports", icon: BarChart3 },
  { href: "settings", label: "Project settings", icon: Settings },
]

const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const project = useProject()
  const projects = useStore(s => s.projects)
  const switcher = usePopover()
  const navOpen = useUi(s => s.navOpen)
  const setNavOpen = useUi(s => s.setNavOpen)
  const go = (href: string) => {
    setNavOpen(false)
    router.push(href)
  }

  return (
    <aside className={classNames(styles.sidebar, navOpen && styles.sidebarOpen)} data-panel="nav">
      <div className={styles.logoRow}>
        <Link href="/projects" className={styles.logo} onClick={() => setNavOpen(false)}>
          <span className={styles.logoMark}>S</span>
          Scrumify
        </Link>
        <button type="button" className={styles.closeNav} aria-label="Close navigation" onClick={() => setNavOpen(false)}>
          <X size={18} />
        </button>
      </div>

      {project && (
        <>
          <button type="button" className={styles.project} {...switcher.triggerProps}>
            <span className={styles.projectIcon} style={{ backgroundColor: project.color }}>
              {project.icon}
            </span>
            <span className={styles.projectText}>
              <span className={styles.projectName}>{project.name}</span>
              <span className={styles.projectType}>Software project</span>
            </span>
            <ChevronsUpDown size={16} className={styles.projectChevron} />
          </button>
          {switcher.anchor && (
            <Popover anchor={switcher.anchor} onClose={switcher.close}>
              <Menu className={styles.switcherMenu}>
                {projects.map(p => (
                  <MenuItem
                    key={p.id}
                    selected={p.id === project.id}
                    icon={<span className={styles.menuProjectIcon} style={{ backgroundColor: p.color }}>{p.icon}</span>}
                    label={p.name}
                    hint={p.key}
                    onClick={() => {
                      switcher.close()
                      go(projectHref(p.key))
                    }}
                  />
                ))}
                <MenuSeparator />
                <MenuItem
                  icon={<LayoutGrid size={16} />}
                  label="View all projects"
                  onClick={() => {
                    switcher.close()
                    go("/projects")
                  }}
                />
                <MenuItem
                  icon={<Plus size={16} />}
                  label="Create project"
                  onClick={() => {
                    switcher.close()
                    go("/projects?new=1")
                  }}
                />
              </Menu>
            </Popover>
          )}

          <nav className={styles.nav}>
            <span className={styles.navHeading}>Planning</span>
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname.replace(/\/$/, "") === `/${href}`
              return (
                <Link
                  key={href}
                  href={projectHref(project.key, href)}
                  className={classNames(styles.navItem, active && styles.navItemActive)}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setNavOpen(false)}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </>
      )}

      {!project && (
        <nav className={styles.nav}>
          <Link href="/projects" className={classNames(styles.navItem, styles.navItemActive)} onClick={() => setNavOpen(false)}>
            <LayoutGrid size={18} />
            Projects
          </Link>
        </nav>
      )}

      <p className={styles.sidebarFooter}>You’re in a demo workspace. Data is saved in this browser.</p>
    </aside>
  )
}

export default Sidebar
