interface Props {
  onClick?: () => void
}

const CloseIcon = ({ onClick }: Props) => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
    className="icon icon-close"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"></path>
  </svg>
)

export default CloseIcon
