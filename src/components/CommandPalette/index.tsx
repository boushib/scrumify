"use client"

import classNames from "classnames"
import { BarChart3, CornerDownLeft, Kanban, Keyboard, LayoutGrid, ListTodo, Moon, Plus, Search, Settings, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useOpenIssue } from "@/components/IssueModal"
import IssueTypeIcon from "@/components/ui/IssueTypeIcon"
import { StatusLozenge } from "@/components/ui/StatusSelect"
import { useProject } from "@/hooks/useProject"
import { useStore } from "@/store"
import { useUi } from "@/store/ui"
import styles from "./CommandPalette.module.sass"

interface Item {
  id: string
  group: "Issues" | "Projects" | "Actions"
  label: string
  hint?: React.ReactNode
  icon: React.ReactNode
  keywords?: string
  run: () => void
}

const MAX_ISSUES = 8

const Palette = () => {
  const router = useRouter()
  const openIssue = useOpenIssue()
  const current = useProject()
  const projects = useStore(s => s.projects)
  const issues = useStore(s => s.issues)
  const theme = useStore(s => s.theme)
  const setTheme = useStore(s => s.setTheme)
  const setPaletteOpen = useUi(s => s.setPaletteOpen)
  const setShortcutsOpen = useUi(s => s.setShortcutsOpen)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const close = () => setPaletteOpen(false)

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase()
    const matches = (text: string) => !q || text.toLowerCase().includes(q)

    // Recently updated issues first; an exact key match jumps to the top
    const issueItems = Object.values(issues)
      .filter(i => matches(`${i.id} ${i.title} ${i.labels.join(" ")}`))
      .sort((a, b) => Number(b.id.toLowerCase() === q) - Number(a.id.toLowerCase() === q) || b.updatedAt - a.updatedAt)
      .slice(0, q ? MAX_ISSUES : 5)
      .map<Item>(issue => {
        const project = projects.find(p => p.id === issue.projectId)
        const status = project?.statuses.find(s => s.id === issue.statusId)
        return {
          id: `issue-${issue.id}`,
          group: "Issues",
          label: issue.title,
          icon: <IssueTypeIcon type={issue.type} />,
          hint: (
            <>
              <span className={styles.key}>{issue.id}</span>
              {status && <StatusLozenge status={status} />}
            </>
          ),
          run: () => {
            // Open on the issue's own project board when it belongs elsewhere
            if (project && project.id !== current?.id) router.push(`/projects/${project.key}/board?issue=${issue.id}`)
            else openIssue(issue.id)
          },
        }
      })

    const projectItems = projects
      .filter(p => matches(`${p.name} ${p.key}`))
      .map<Item>(p => ({
        id: `project-${p.id}`,
        group: "Projects",
        label: p.name,
        hint: <span className={styles.key}>{p.key}</span>,
        icon: (
          <span className={styles.projectIcon} style={{ backgroundColor: p.color }}>
            {p.icon}
          </span>
        ),
        run: () => router.push(`/projects/${p.key}/board`),
      }))

    const go = (path: string) => () => current && router.push(`/projects/${current.key}/${path}`)
    const actions: Item[] = [
      { id: "create", group: "Actions", label: "Create issue", icon: <Plus size={16} />, hint: <kbd>C</kbd>, run: () => window.dispatchEvent(new Event("scrumify:create")) },
      ...(current
        ? [
            { id: "board", group: "Actions" as const, label: "Go to board", icon: <Kanban size={16} />, hint: <kbd>G B</kbd>, run: go("board") },
            { id: "backlog", group: "Actions" as const, label: "Go to backlog", icon: <ListTodo size={16} />, hint: <kbd>G L</kbd>, run: go("backlog") },
            { id: "reports", group: "Actions" as const, label: "Go to reports", icon: <BarChart3 size={16} />, hint: <kbd>G R</kbd>, run: go("reports") },
            { id: "settings", group: "Actions" as const, label: "Project settings", icon: <Settings size={16} />, hint: <kbd>G S</kbd>, run: go("settings") },
          ]
        : []),
      { id: "projects", group: "Actions", label: "View all projects", icon: <LayoutGrid size={16} />, hint: <kbd>G P</kbd>, run: () => router.push("/projects") },
      { id: "new-project", group: "Actions", label: "Create project", icon: <Plus size={16} />, run: () => router.push("/projects?new=1") },
      {
        id: "theme",
        group: "Actions",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        keywords: "theme dark light mode",
        icon: theme === "dark" ? <Sun size={16} /> : <Moon size={16} />,
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      { id: "shortcuts", group: "Actions", label: "Keyboard shortcuts", icon: <Keyboard size={16} />, hint: <kbd>?</kbd>, run: () => setShortcutsOpen(true) },
    ]
    const actionItems = actions.filter(a => matches(`${a.label} ${a.keywords ?? ""}`))

    // Without a query, actions come first; with one, issues are what people look for
    return q ? [...issueItems, ...projectItems, ...actionItems] : [...actionItems, ...issueItems, ...projectItems]
  }, [query, issues, projects, current, theme, router, openIssue, setTheme, setShortcutsOpen])

  const selected = Math.min(active, items.length - 1)
  const run = (item: Item | undefined) => {
    if (!item) return
    close()
    item.run()
  }

  let lastGroup: string | null = null

  return createPortal(
    <div className={styles.backdrop} onMouseDown={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={styles.palette}
        onMouseDown={e => e.stopPropagation()}
      >
        <label className={styles.inputRow}>
          <Search size={18} />
          <input
            autoFocus
            value={query}
            placeholder="Search issues, projects and actions…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={items[selected] ? `palette-${items[selected].id}` : undefined}
            onChange={e => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={e => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setActive((selected + 1) % Math.max(1, items.length))
              } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setActive((selected - 1 + items.length) % Math.max(1, items.length))
              } else if (e.key === "Enter") {
                e.preventDefault()
                run(items[selected])
              } else if (e.key === "Escape") {
                e.preventDefault()
                close()
              }
            }}
          />
          <kbd>Esc</kbd>
        </label>
        <ul id="palette-results" role="listbox" className={`${styles.results} scroller`}>
          {items.length === 0 && <li className={styles.empty}>No results for “{query}”</li>}
          {items.map((item, index) => {
            const heading = item.group !== lastGroup ? item.group : null
            lastGroup = item.group
            return (
              <li key={item.id} role="presentation">
                {heading && <div className={styles.group}>{heading}</div>}
                <div
                  id={`palette-${item.id}`}
                  role="option"
                  aria-selected={index === selected}
                  className={classNames(styles.item, index === selected && styles.itemActive)}
                  onMouseMove={() => index !== selected && setActive(index)}
                  onClick={() => run(item)}
                  ref={el => {
                    if (el && index === selected) el.scrollIntoView({ block: "nearest" })
                  }}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                  {item.hint && <span className={styles.hint}>{item.hint}</span>}
                  {index === selected && <CornerDownLeft size={14} className={styles.enter} />}
                </div>
              </li>
            )
          })}
        </ul>
        <footer className={styles.footer}>
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> to navigate
          </span>
          <span>
            <kbd>↵</kbd> to select
          </span>
          <span>
            <kbd>?</kbd> for all shortcuts
          </span>
        </footer>
      </div>
    </div>,
    document.body
  )
}

const CommandPalette = () => {
  const open = useUi(s => s.paletteOpen)
  return open ? <Palette /> : null
}

export default CommandPalette
