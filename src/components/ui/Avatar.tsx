import classNames from "classnames"
import { initials } from "@/lib/format"
import type { User } from "@/models"
import styles from "./ui.module.sass"

interface Props {
  user?: User | null
  size?: number
  className?: string
  title?: string
}

/** Initials avatar; an empty dashed circle means "unassigned" */
const Avatar = ({ user, size = 24, className, title }: Props) => (
  <span
    className={classNames(styles.avatar, !user && styles.avatarEmpty, className)}
    style={{
      width: size,
      height: size,
      fontSize: Math.max(9, size * 0.4),
      backgroundColor: user?.color,
    }}
    title={title ?? user?.name ?? "Unassigned"}
    aria-label={title ?? user?.name ?? "Unassigned"}
  >
    {user ? initials(user.name) : null}
  </span>
)

export default Avatar
