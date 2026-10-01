import { Story } from "@/models";
import "./StoryOverview.sass";
interface Props {
    story: Story;
    onClick: () => void;
}
declare const StoryOverview: ({ story, onClick }: Props) => import("react").JSX.Element;
export default StoryOverview;
