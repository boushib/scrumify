import { Story, StoryStatus } from "@/models";
import "./CreateStory.sass";
interface Props {
    status: StoryStatus;
    storiesLength: number;
    onCreate: (story: Story) => void;
    onClose: () => void;
}
declare const CreateStory: ({ status, storiesLength, onCreate, onClose }: Props) => import("react").JSX.Element;
export default CreateStory;
