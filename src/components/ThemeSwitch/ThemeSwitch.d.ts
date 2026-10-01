import "./ThemeSwitch.sass";
interface Props {
    isLight: boolean;
    onChange: () => void;
}
declare const ThemeSwitch: ({ isLight, onChange }: Props) => import("react").JSX.Element;
export default ThemeSwitch;
