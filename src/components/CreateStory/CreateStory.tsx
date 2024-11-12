import { useState } from "react"
import CloseIcon from "@/icons/Close"
import { Story, StoryStatus } from "@/models"
import Button from "@/components/Button"
import FormInput from "@/components/FormInput"
import Textarea from "@/components/Textarea"
import "./CreateStory.sass"

interface Props {
  status: StoryStatus
  storiesLength: number
  onCreate: (story: Story) => void
  onClose: () => void
}

const CreateStory = ({ status, storiesLength, onCreate, onClose }: Props) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleCreateStory = () => {
    // TODO - Handle showing error if any
    if (title && description) {
      const story = {
        id: `AB-${storiesLength + 1}`,
        title,
        description,
        status,
        assignee: "El Hassane", // hardcode assignee for now
      }
      onCreate(story)
    }
  }

  return (
    <div className="create-story">
      <div className="story__wrapper">
        <div className="story">
          <CloseIcon onClick={onClose} />
          <h2 className="story__title">New Story</h2>
          <hr />
          <FormInput
            value={title}
            onChange={setTitle}
            placeholder="Story title..."
          />
          <Textarea
            value={description}
            onChange={setDescription}
            placeholder="Story description..."
          />
          <Button onClick={handleCreateStory}>Create Story</Button>
        </div>
      </div>
    </div>
  )
}

export default CreateStory
