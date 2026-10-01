import './FormInput.sass';
interface Props {
    type?: string;
    value: string;
    maxLength?: number;
    disabled?: boolean;
    autoFocus?: boolean;
    placeholder?: string;
    onChange: (value: string) => void;
}
declare const FormInput: ({ type, value, maxLength, disabled, autoFocus, placeholder, onChange, }: Props) => import("react").JSX.Element;
export default FormInput;
