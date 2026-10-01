"use client"

import { Moon, Plus, RotateCcw, Search, Sun } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import Popover, { Menu, MenuItem, MenuSeparator, usePopover } from "@/components/ui/Popover"
import { toast } from "@/components/ui/Toasts"
import { CURRENT_USER_ID, useStore } from "@/store"
import styles from "./layout.module.sass"

const Topbar = () => {
  const theme = useStore(s => s.theme)
  const setTheme = useStore(s => s.setTheme)
  const resetDemo = useStore(s => s.resetDemo)
  const me = useStore(s => s.users.find(u => u.id === CURRENT_USER_ID))
  const userMenu = usePopover()

  return (
    <header className={styles.topbar}>
      <button type="button" className={styles.search} onClick={() => window.dispatchEvent(new Event("scrumify:search"))}>
        <Search size={16} />
        <span>Search issues…</span>
        <kbd>⌘K</kbd>
      </button>
      <Button variant="primary" icon={<Plus size={16} />} onClick={() => window.dispatchEvent(new Event("scrumify:create"))}>
        Create
      </Button>
      <div className={styles.topbarTail}>
        <Button
          variant="subtle"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          icon={theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
