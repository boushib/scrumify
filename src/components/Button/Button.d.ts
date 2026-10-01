import "./Button.sass";
interface Props {
    children: React.ReactNode;
    isDisabled?: boolean;
    isSecondary?: boolean;
    onClick?: () => void;
}
declare const Button: ({ children, isDisabled, isSecondary, onClick }: Props) => import("react").JSX.Element;
export default Button;
