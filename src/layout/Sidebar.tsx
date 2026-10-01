"use client"

import classNames from "classnames"
import { BarChart3, ChevronsUpDown, Kanban, LayoutGrid, ListTodo, Plus, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Popover, { Menu, MenuItem, MenuSeparator, usePopover } from "@/components/ui/Popover"
import { useProject } from "@/hooks/useProject"
import { useStore } from "@/store"
import styles from "./layout.module.sass"

const NAV = [
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

  return (
    <aside className={styles.sidebar} data-panel="nav">
      <Link href="/projects" className={styles.logo}>
        <span className={styles.logoMark}>S</span>
        Scrumify
      </Link>

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
                      router.push(`/projects/${p.key}/board`)
                    }}
                  />
                ))}
                <MenuSeparator />
                <MenuItem
                  icon={<LayoutGrid size={16} />}
                  label="View all projects"
                  onClick={() => {
                    switcher.close()
                    router.push("/projects")
                  }}
                />
                <MenuItem
                  icon={<Plus size={16} />}
                  label="Create project"
                  onClick={() => {
                    switcher.close()
                    router.push("/projects?new=1")
                  }}
                />
              </Menu>
            </Popover>
          )}

          <nav className={styles.nav}>
            <span className={styles.navHeading}>Planning</span>
            {NAV.map(({ href, label, icon: Icon }) => {
              const to = `/projects/${project.key}/${href}`
              return (
                <Link key={href} href={to} className={classNames(styles.navItem, pathname === to && styles.navItemActive)}>
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
          <Link href="/projects" className={classNames(styles.navItem, styles.navItemActive)}>
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
