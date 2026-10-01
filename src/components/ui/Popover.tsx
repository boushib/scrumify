"use client"

import classNames from "classnames"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import styles from "./ui.module.sass"

/**
 * Only one popover is open at a time. Triggers stop mousedown (so a click on
 * a trigger doesn't count as "outside" its own popover), which also hides the
 * click from other open popovers, so opening one closes the previous one here.
 */
let closeOpen: (() => void) | null = null

/** Anchor state plus props for the element that toggles a popover */
export const usePopover = () => {
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const close = useCallback(function close() {
    setAnchor(null)
    if (closeOpen === close) closeOpen = null
  }, [])
  const triggerProps = {
    "aria-expanded": anchor !== null,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      if (anchor) {
        close()
        return
      }
      if (closeOpen !== close) closeOpen?.()
      closeOpen = close
      setAnchor(e.currentTarget.getBoundingClientRect())
    },
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
  }
  return { anchor, close, triggerProps }
}

interface Props {
  anchor: DOMRect
  onClose: () => void
  align?: "start" | "end"
  placement?: "bottom" | "top"
  className?: string
  children: React.ReactNode
}

const MARGIN = 8

/** Floating layer under (or above) an anchor; closes on outside click or Escape */
const Popover = ({ anchor, onClose, align = "start", placement = "bottom", className, children }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener("mousedown", onDown)
    window.addEventListener("keydown", onKey, true)
    return () => {
      document.removeEventListener("mousedown", onDown)
      window.removeEventListener("keydown", onKey, true)
    }
  }, [onClose])

  // Keep the popover inside the viewport once it has a size
  const measure = useCallback((el: HTMLDivElement | null) => {
    ref.current = el
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx =
      rect.right > window.innerWidth - MARGIN
        ? window.innerWidth - MARGIN - rect.right
        : rect.left < MARGIN
          ? MARGIN - rect.left
          : 0
    const dy = rect.bottom > window.innerHeight - MARGIN ? window.innerHeight - MARGIN - rect.bottom : 0
    if (dx) el.style.left = `${parseFloat(el.style.left) + dx}px`
    if (dy) el.style.top = `${parseFloat(el.style.top) + dy}px`
  }, [])

  const style: React.CSSProperties =
    placement === "bottom"
      ? { top: anchor.bottom + 4, left: align === "start" ? anchor.left : anchor.right }
      : { top: anchor.top - 4, left: align === "start" ? anchor.left : anchor.right }
  const transform = [align === "end" && "translateX(-100%)", placement === "top" && "translateY(-100%)"]
    .filter(Boolean)
    .join(" ")

  return createPortal(
    <div ref={measure} className={classNames(styles.popover, className)} style={{ ...style, transform: transform || undefined }}>
      {children}
    </div>,
    document.body
  )
}

export default Popover

export const Menu = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div role="menu" className={classNames(styles.menu, className)}>
    {children}
  </div>
)

interface MenuItemProps {
  label: React.ReactNode
  icon?: React.ReactNode
  hint?: React.ReactNode
  selected?: boolean
  danger?: boolean
  onClick?: () => void
}

export const MenuItem = ({ label, icon, hint, selected, danger, onClick }: MenuItemProps) => (
  <button
    type="button"
    role="menuitem"
    className={classNames(styles.menuItem, selected && styles.menuItemSelected, danger && styles.menuItemDanger)}
    onClick={onClick}
  >
    {icon && <span className={styles.menuIcon}>{icon}</span>}
    <span className={styles.menuLabel}>{label}</span>
    {hint && <span className={styles.menuHint}>{hint}</span>}
  </button>
)

export const MenuSeparator = () => <div className={styles.menuSeparator} role="separator" />
