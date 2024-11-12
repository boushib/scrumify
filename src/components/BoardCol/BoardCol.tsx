import { Story, StoryStatus } from "@/models"
import { getTitleFtomStatus } from "@/utils"
import StoryOverview from "@/components/StoryOverview"
import "./BoardCol.sass"

interface Props {
  stories: Array<Story>
  status: StoryStatus
  onOpenStory: (story: Story) => void
  onUpdateStory: (storyId: string, status: StoryStatus) => void
  onCreateStory: (status: StoryStatus) => void
}

const BoardCol = ({
  status,
  stories,
  onOpenStory,
  onUpdateStory,
  onCreateStory,
}: Props) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const storyId = e.dataTransfer.getData("storyId")
    onUpdateStory(storyId, status)
  }

  return (
    <div className="board-col" onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="board-col__title">
        {getTitleFtomStatus(status)} - {stories.length} issue
        {stories.length === 1 ? "" : "s"}
      </div>
      <hr />
      {stories.map((s) => (
        <StoryOverview story={s} onClick={() => onOpenStory(s)} key={s.id} />
      ))}
      <div
        className="board-col__add"
        onClick={() => onCreateStory(status)}
        role="button"
      >
        + New story
      </div>
    </div>
  )
}

export default BoardCol
