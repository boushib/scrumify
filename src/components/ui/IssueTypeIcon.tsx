import { Bookmark, Bug, CheckSquare, Zap } from "lucide-react"
import type { IssueType } from "@/models"
import styles from "./ui.module.sass"

export const ISSUE_TYPES: { type: IssueType; label: string; color: string }[] = [
  { type: "story", label: "Story", color: "#63ba3c" },
  { type: "task", label: "Task", color: "#4bade8" },
  { type: "bug", label: "Bug", color: "#e5493a" },
  { type: "epic", label: "Epic", color: "#904ee2" },
]

const ICONS = { story: Bookmark, task: CheckSquare, bug: Bug, epic: Zap }

const IssueTypeIcon = ({ type, size = 16 }: { type: IssueType; size?: number }) => {
  const Icon = ICONS[type]
  const color = ISSUE_TYPES.find(t => t.type === type)!.color
  return (
    <span className={styles.typeIcon} style={{ backgroundColor: color, width: size, height: size }} title={type}>
      <Icon size={size * 0.68} strokeWidth={2.6} color="#fff" fill={type === "story" ? "#fff" : "none"} />
    </span>
  )
}

export default IssueTypeIcon
