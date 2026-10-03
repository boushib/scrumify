"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { isTyping } from "@/components/CreateIssueModal"
import Modal from "@/components/ui/Modal"
import { useProject } from "@/hooks/useProject"
import { useUi } from "@/store/ui"
import styles from "./Shortcuts.module.sass"
import { projectHref, type ProjectView } from "@/lib/routes"

const GROUPS: { title: string; keys: [string[], string][] }[] = [
  {
    title: "Global",
    keys: [
      [["⌘", "K"], "Open the command palette"],
      [["/"], "Search"],
      [["C"], "Create an issue"],
      [["?"], "Show keyboard shortcuts"],
    ],
  },
  {
    title: "Navigation",
    keys: [
      [["G", "B"], "Go to the board"],
      [["G", "L"], "Go to the backlog"],
      [["G", "R"], "Go to reports"],
      [["G", "S"], "Go to project settings"],
      [["G", "P"], "Go to all projects"],
    ],
  },
  {
    title: "Boards and lists",
    keys: [
      [["Space"], "Pick up or drop a focused card"],
      [["↑", "↓", "←", "→"], "Move a picked-up card"],
      [["Enter"], "Open the focused issue"],
      [["Esc"], "Cancel a drag or close a dialog"],
    ],
  },
  {
    title: "Editing",
    keys: [
      [["Enter"], "Save a comment"],
      [["Shift", "Enter"], "New line in a comment"],
      [["⌘", "Enter"], "Save a description"],
      [["Esc"], "Cancel editing"],
    ],
  },
]

const GO: Record<string, ProjectView> = { b: "board", l: "backlog", r: "reports", s: "settings" }

/** Global keyboard shortcuts and the "?" help dialog */
const Shortcuts = () => {
  const router = useRouter()
  const project = useProject()
  const open = useUi(s => s.shortcutsOpen)
  const setOpen = useUi(s => s.setShortcutsOpen)
  const setPaletteOpen = useUi(s => s.setPaletteOpen)
  const pendingG = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K works everywhere, even while typing
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen(!useUi.getState().paletteOpen)
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || document.querySelector("[role=dialog]")) return

      const key = e.key.toLowerCase()
      if (Date.now() - pendingG.current < 1200) {
        pendingG.current = 0
        if (key === "p") router.push("/projects")
        else if (GO[key] && project) router.push(projectHref(project.key, GO[key]))
        return
      }
      if (key === "g") pendingG.current = Date.now()
      // Some layouts report Shift+/ instead of "?"
      else if (e.key === "?" || (e.key === "/" && e.shiftKey)) setOpen(true)
      else if (e.key === "/") {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [project, router, setOpen, setPaletteOpen])

  if (!open) return null

  return (
    <Modal title="Keyboard shortcuts" onClose={() => setOpen(false)} width={640}>
      <div className={styles.groups}>
        {GROUPS.map(group => (
          <section key={group.title}>
            <h3>{group.title}</h3>
            <dl>
              {group.keys.map(([keys, label]) => (
                <div key={label + keys.join()} className={styles.row}>
                  <dt>{label}</dt>
                  <dd>
                    {keys.map(k => (
                      <kbd key={k}>{k}</kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Modal>
  )
}

export default Shortcuts
