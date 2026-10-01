"use client"

import classNames from "classnames"
import { Check, ChevronDown } from "lucide-react"
import type { Status } from "@/models"
import Popover, { Menu, usePopover } from "./Popover"
import styles from "./ui.module.sass"

/** Jira-style status lozenge, colored by category */
export const StatusLozenge = ({ status, className }: { status: Status; className?: string }) => (
  <span className={classNames(styles.lozenge, styles[`lozenge_${status.category}`], className)}>{status.name}</span>
)

interface Props {
  statuses: Status[]
  value: string
  onChange: (statusId: string) => void
  size?: "sm" | "md"
}

const StatusSelect = ({ statuses, value, onChange, size = "md" }: Props) => {
  const { anchor, close, triggerProps } = usePopover()
  const current = statuses.find(s => s.id === value) ?? statuses[0]

  return (
    <>
      <button
        type="button"
        aria-label={`Status: ${current.name}`}
        className={classNames(
          styles.statusButton,
          styles[`lozenge_${current.category}`],
          size === "sm" && styles.statusButtonSmall
        )}
        {...triggerProps}
      >
        {current.name}
        <ChevronDown size={size === "sm" ? 12 : 14} />
      </button>
      {anchor && (
        <Popover anchor={anchor} onClose={close}>
          <Menu>
            {statuses.map(status => (
              <button
                key={status.id}
                type="button"
                role="menuitemradio"
                aria-checked={status.id === value}
                className={styles.menuItem}
                onClick={() => {
                  close()
                  if (status.id !== value) onChange(status.id)
                }}
              >
                <span className={styles.menuLabel}>
                  <StatusLozenge status={status} />
                </span>
                {status.id === value && <Check size={14} className={styles.menuCheck} />}
              </button>
            ))}
          </Menu>
        </Popover>
      )}
    </>
  )
}

export default StatusSelect
