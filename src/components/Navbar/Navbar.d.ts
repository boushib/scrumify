import "./Navbar.sass";
interface Props {
    isLight: boolean;
    onThemeChange: () => void;
}
declare const Navbar: ({ isLight, onThemeChange }: Props) => import("react").JSX.Element;
export default Navbar;
