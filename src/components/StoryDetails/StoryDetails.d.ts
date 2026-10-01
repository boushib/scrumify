import { Story } from "@/models";
import "./StoryDetails.sass";
interface Props {
    story: Story;
    onClose: () => void;
}
declare const StoryDetails: ({ story, onClose }: Props) => import("react").JSX.Element;
export default StoryDetails;
