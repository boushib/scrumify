import "./Textarea.sass";
interface Props {
    value: string;
    maxLength?: number;
    disabled?: boolean;
    autoFocus?: boolean;
    placeholder?: string;
    onChange: (value: string) => void;
}
declare const Textarea: ({ value, maxLength, disabled, autoFocus, placeholder, onChange, }: Props) => import("react").JSX.Element;
export default Textarea;
