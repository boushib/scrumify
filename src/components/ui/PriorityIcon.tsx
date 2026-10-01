import { ChevronDown, ChevronsDown, ChevronsUp, ChevronUp, Equal } from "lucide-react"
import type { Priority } from "@/models"

export const PRIORITIES: { priority: Priority; label: string; color: string }[] = [
  { priority: "highest", label: "Highest", color: "#e5493a" },
  { priority: "high", label: "High", color: "#f97316" },
  { priority: "medium", label: "Medium", color: "#e2b203" },
  { priority: "low", label: "Low", color: "#2684ff" },
  { priority: "lowest", label: "Lowest", color: "#579dff" },
]

const ICONS = { highest: ChevronsUp, high: ChevronUp, medium: Equal, low: ChevronDown, lowest: ChevronsDown }

const PriorityIcon = ({ priority, size = 16 }: { priority: Priority; size?: number }) => {
  const Icon = ICONS[priority]
  const { color, label } = PRIORITIES.find(p => p.priority === priority)!
  return <Icon size={size} color={color} strokeWidth={2.6} aria-label={`${label} priority`} />
}

export default PriorityIcon
