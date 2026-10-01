"use client"

import { Keyboard, Menu as MenuIcon, Moon, Plus, RotateCcw, Search, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import Popover, { Menu, MenuItem, MenuSeparator, usePopover } from "@/components/ui/Popover"
import { toast } from "@/components/ui/Toasts"
import { CURRENT_USER_ID, useStore } from "@/store"
import { useUi } from "@/store/ui"
import styles from "./layout.module.sass"

const Topbar = () => {
  const theme = useStore(s => s.theme)
  const setTheme = useStore(s => s.setTheme)
  const resetDemo = useStore(s => s.resetDemo)
  const me = useStore(s => s.users.find(u => u.id === CURRENT_USER_ID))
  const userMenu = usePopover()
  const setNavOpen = useUi(s => s.setNavOpen)
  const setPaletteOpen = useUi(s => s.setPaletteOpen)
  const setShortcutsOpen = useUi(s => s.setShortcutsOpen)

  // The new theme grows out of the toggle as a circle (View Transitions API);
  // browsers without it, or with reduced motion, just switch
  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = theme === "dark" ? "light" : "dark"
    const apply = () => {
      flushSync(() => setTheme(next))
      document.documentElement.dataset.theme = next
    }
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply()
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: "cubic-bezier(.2, .9, .3, 1)", pseudoElement: "::view-transition-new(root)" }
      )
    })
  }

  return (
    <header className={styles.topbar}>
      <Button
        variant="subtle"
        className={styles.menuButton}
        icon={<MenuIcon size={20} />}
        aria-label="Open navigation"
        onClick={() => setNavOpen(true)}
      />
      <button type="button" className={styles.search} aria-label="Search" onClick={() => setPaletteOpen(true)}>
        <Search size={16} />
        <span>Search issues…</span>
        <kbd>⌘K</kbd>
      </button>
      <Button
        variant="primary"
        icon={<Plus size={16} />}
        aria-label="Create issue"
        onClick={() => window.dispatchEvent(new Event("scrumify:create"))}
      >
        <span className={styles.createLabel}>Create</span>
      </Button>
      <div className={styles.topbarTail}>
        <Button
          variant="subtle"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          icon={
            <span key={theme} className={styles.themeIcon}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </span>
          }
          onClick={toggleTheme}
        />
        <button type="button" className={styles.userButton} aria-label="Account" {...userMenu.triggerProps}>
          <Avatar user={me} size={30} />
        </button>
        {userMenu.anchor && (
          <Popover anchor={userMenu.anchor} onClose={userMenu.close} align="end">
            <Menu>
              <div className={styles.userCard}>
                <Avatar user={me} size={36} />
                <div>
                  <div className={styles.userName}>{me?.name}</div>
                  <div className={styles.userEmail}>{me?.email}</div>
                </div>
              </div>
              <MenuSeparator />
              <MenuItem
                icon={<Keyboard size={16} />}
                label="Keyboard shortcuts"
                hint="?"
                onClick={() => {
                  userMenu.close()
                  setShortcutsOpen(true)
                }}
              />
              <MenuItem
                icon={<RotateCcw size={16} />}
                label="Reset demo data"
                danger
                onClick={() => {
                  userMenu.close()
                  resetDemo()
                  toast("Demo data restored", "success")
                }}
              />
            </Menu>
          </Popover>
        )}
      </div>
    </header>
  )
}

export default Topbar
