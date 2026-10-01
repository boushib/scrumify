import classNames from "classnames"
import styles from "./ui.module.sass"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "subtle" | "danger"
  size?: "sm" | "md"
  icon?: React.ReactNode
}

const Button = ({ variant = "secondary", size = "md", icon, className, children, type = "button", ...props }: Props) => (
  <button
    type={type}
    className={classNames(styles.button, styles[variant], size === "sm" && styles.small, !children && styles.iconOnly, className)}
    {...props}
  >
    {icon}
    {children}
  </button>
)

export default Button
