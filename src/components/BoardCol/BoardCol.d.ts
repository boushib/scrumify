import { Story, StoryStatus } from "@/models";
import "./BoardCol.sass";
interface Props {
    stories: Array<Story>;
    status: StoryStatus;
    onOpenStory: (story: Story) => void;
    onUpdateStory: (storyId: string, status: StoryStatus) => void;
    onCreateStory: (status: StoryStatus) => void;
}
declare const BoardCol: ({ status, stories, onOpenStory, onUpdateStory, onCreateStory, }: Props) => import("react").JSX.Element;
export default BoardCol;
