"use client"

import classNames from "classnames"
import { Check, ChevronDown } from "lucide-react"
import Popover, { Menu, usePopover } from "./Popover"
import styles from "./ui.module.sass"

export interface Option<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface Props<T extends string> {
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  label?: string
  className?: string
  compact?: boolean
}

/** Dropdown select styled like the rest of the app */
const Select = <T extends string>({ value, options, onChange, label, className, compact }: Props<T>) => {
  const { anchor, close, triggerProps } = usePopover()
  const current = options.find(o => o.value === value)

  return (
    <>
      <button
        type="button"
        className={classNames(styles.select, compact && styles.selectCompact, className)}
        aria-label={label}
        {...triggerProps}
      >
        {current?.icon}
        <span className={styles.selectLabel}>{current?.label ?? "Select…"}</span>
        <ChevronDown size={14} className={styles.selectChevron} />
      </button>
      {anchor && (
        <Popover anchor={anchor} onClose={close}>
          <Menu className={styles.selectMenu}>
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={option.value === value}
                className={classNames(styles.menuItem, option.value === value && styles.menuItemSelected)}
                onClick={() => {
                  onChange(option.value)
                  close()
                }}
              >
                {option.icon && <span className={styles.menuIcon}>{option.icon}</span>}
                <span className={styles.menuLabel}>{option.label}</span>
                {option.value === value && <Check size={14} className={styles.menuCheck} />}
              </button>
            ))}
          </Menu>
        </Popover>
      )}
    </>
  )
}

export default Select
