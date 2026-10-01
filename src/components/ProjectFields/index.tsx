"use client"

import classNames from "classnames"
import { Check } from "lucide-react"
import type { Project } from "@/models"
import styles from "./ProjectFields.module.sass"

export const PROJECT_ICONS = ["🚀", "📱", "🛒", "🎨", "🧪", "📊", "🛠️", "🌍", "🎮", "💬", "🔒", "⚡", "🧭", "📦", "🎯", "🌱"]
export const PROJECT_COLORS = ["#ff7a51", "#e5493a", "#e2b203", "#22a06b", "#1d7afc", "#6554c0", "#904ee2", "#8993a4"]

/** Suggest a project key from its name: initials, or the first letters of a single word */
export const suggestKey = (name: string) => {
  const words = name.toUpperCase().replace(/[^A-Z0-9 ]/g, "").split(/\s+/).filter(Boolean)
  if (!words.length) return ""
  const key = words.length > 1 ? words.map(w => w[0]).join("") : words[0].slice(0, 3)
  return key.replace(/^[0-9]+/, "").slice(0, 6)
}

/** Error message for a project key, or null when it's fine */
export const validateKey = (key: string, projects: Project[], ownId?: string) => {
  if (!key) return "Key is required"
  if (!/^[A-Z][A-Z0-9]{1,5}$/.test(key)) return "2–6 letters or digits, starting with a letter"
  if (projects.some(p => p.key === key && p.id !== ownId)) return "Another project uses this key"
  return null
}

export const IconPicker = ({ value, onChange }: { value: string; onChange: (icon: string) => void }) => (
  <div className={styles.icons} role="radiogroup" aria-label="Project icon">
    {PROJECT_ICONS.map(icon => (
      <button
        key={icon}
        type="button"
        role="radio"
        aria-checked={icon === value}
        className={classNames(styles.icon, icon === value && styles.iconActive)}
        onClick={() => onChange(icon)}
      >
        {icon}
      </button>
    ))}
  </div>
)

export const ColorPicker = ({ value, onChange }: { value: string; onChange: (color: string) => void }) => (
  <div className={styles.colors} role="radiogroup" aria-label="Project color">
    {PROJECT_COLORS.map(color => (
      <button
        key={color}
        type="button"
        role="radio"
        aria-checked={color === value}
        aria-label={color}
        className={styles.color}
        style={{ backgroundColor: color }}
        onClick={() => onChange(color)}
      >
        {color === value && <Check size={14} strokeWidth={3} />}
      </button>
    ))}
  </div>
)

export const ProjectAvatar = ({ icon, color, size = 40 }: { icon: string; color: string; size?: number }) => (
  <span className={styles.avatar} style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.5 }}>
    {icon}
  </span>
)
