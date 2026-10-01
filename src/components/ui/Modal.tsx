"use client"

import classNames from "classnames"
import { X } from "lucide-react"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import styles from "./ui.module.sass"

interface Props {
  title?: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
  width?: number
  className?: string
  bodyClassName?: string
  /** Accessible name when there is no visible title */
  label?: string
  children: React.ReactNode
}

const Modal = ({ title, onClose, footer, width = 520, className, bodyClassName, label, children }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return createPortal(
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={classNames(styles.modal, className)}
        style={{ maxWidth: width }}
        onMouseDown={e => e.stopPropagation()}
      >
        {title && (
          <header className={styles.modalHeader}>
            <h2>{title}</h2>
            <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </header>
        )}
        <div className={classNames(styles.modalBody, bodyClassName)}>{children}</div>
        {footer && <footer className={styles.modalFooter}>{footer}</footer>}
      </div>
    </div>,
    document.body
  )
}

export default Modal
