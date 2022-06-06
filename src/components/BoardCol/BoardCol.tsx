import { Story, StoryStatus } from '../../models'
import StoryOverview from '../StoryOverview'
import './BoardCol.sass'

interface Props {
  stories: Array<Story>
  status: StoryStatus
  onOpenStory: (story: Story) => void
}

const BoardCol = ({ status, stories, onOpenStory }: Props) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const getTitle = () => {
    switch (status) {
      case StoryStatus.TODO:
        return 'TODO'
      case StoryStatus.IN_PROGRESS:
        return 'In Progress'
      case StoryStatus.DONE:
        return 'Done'
      default:
        return 'Backlog'
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const storyId = e.dataTransfer.getData('storyId')
    const target = e.currentTarget as HTMLDivElement
    const story = document.getElementById(storyId)
    story && target.appendChild(story)
    const storedStories = localStorage.getItem('stories')
    const stories: Array<Story> = storedStories ? JSON.parse(storedStories) : []
    const index = stories.findIndex((s) => s.id === storyId)
    stories[index].status = status
    localStorage.setItem('stories', JSON.stringify(stories))
  }

  return (
    <div className="board-col" onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="board-col__title">
        {getTitle()} - {stories.length} issue{stories.length === 1 ? '' : 's'}
      </div>
      <hr />
      {stories.map((s) => (
        <StoryOverview story={s} onClick={() => onOpenStory(s)} key={s.id} />
      ))}
    </div>
  )
}

export default BoardCol
