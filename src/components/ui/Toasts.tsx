"use client"

import classNames from "classnames"
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react"
import { create } from "zustand"
import styles from "./ui.module.sass"

type Tone = "info" | "success" | "danger"
interface ToastItem {
  id: number
  message: string
  tone: Tone
  action?: { label: string; onClick: () => void }
}

interface ToastState {
  toasts: ToastItem[]
  push: (message: string, tone?: Tone, action?: ToastItem["action"]) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToasts = create<ToastState>(set => ({
  toasts: [],
  push: (message, tone = "info", action) => {
    const id = nextId++
    set(s => ({ toasts: [...s.toasts.slice(-3), { id, message, tone, action }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4500)
  },
  dismiss: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

/** Shorthand for components: toast("Saved", "success") */
export const toast = (message: string, tone?: Tone, action?: ToastItem["action"]) =>
  useToasts.getState().push(message, tone, action)

const ICONS = { info: Info, success: CheckCircle2, danger: TriangleAlert }

const Toasts = () => {
  const { toasts, dismiss } = useToasts()
  return (
    <div className={styles.toasts} aria-live="polite">
      {toasts.map(t => {
        const Icon = ICONS[t.tone]
        return (
          <div key={t.id} className={classNames(styles.toast, styles[`toast_${t.tone}`])}>
            <Icon size={18} className={styles.toastIcon} />
            <span className={styles.toastMessage}>{t.message}</span>
            {t.action && (
              <button
                type="button"
                className={styles.toastAction}
                onClick={() => {
                  t.action!.onClick()
                  dismiss(t.id)
                }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" className={styles.toastClose} aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default Toasts
