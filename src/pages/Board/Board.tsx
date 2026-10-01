import { useState } from "react"
import BoardCol from "@/components/BoardCol"
import CreateStory from "@/components/CreateStory"
import StoryDetails from "@/components/StoryDetails"
import { STORIES } from "@/constants"
import { Story, StoryStatus } from "@/models"
import "./Board.sass"

const Board = () => {
  const [stories, setStories] = useState<Array<Story>>(() => {
    const storedStories = localStorage.getItem("stories")
    return storedStories ? JSON.parse(storedStories) : STORIES
  })
  const [selectedStory, setSelectedStory] = useState<Story>()
  const [selectedStatus, setSelectedStatus] = useState<StoryStatus>()

  const handleUpdateStory = (storyId: string, status: StoryStatus) => {
    const _stories = [...stories]
    const index = _stories.findIndex((s) => s.id === storyId)
    _stories[index].status = status
    localStorage.setItem("stories", JSON.stringify(_stories))
    setStories(_stories)
  }

  const handleStoryCreated = (story: Story) => {
    const _stories = [...stories, story]
    setStories(_stories)
    localStorage.setItem("stories", JSON.stringify(_stories))
    setSelectedStatus(undefined)
  }

  return (
    <div className="board page">
      <div className="container">
        <div className="board__grid">
          {(Object.keys(StoryStatus) as Array<keyof typeof StoryStatus>).map(
            (key) => (
              <BoardCol
                status={StoryStatus[key]}
                stories={stories.filter((s) => s.status === StoryStatus[key])}
                onOpenStory={setSelectedStory}
                onUpdateStory={handleUpdateStory}
                onCreateStory={setSelectedStatus}
                key={key}
              />
            )
          )}
        </div>
      </div>
      {selectedStory && (
        <StoryDetails
          story={selectedStory}
          onClose={() => setSelectedStory(undefined)}
        />
      )}
      {selectedStatus && (
        <CreateStory
          status={selectedStatus}
          storiesLength={stories.length}
          onClose={() => setSelectedStatus(undefined)}
          onCreate={handleStoryCreated}
        />
      )}
    </div>
  )
}

export default Board
