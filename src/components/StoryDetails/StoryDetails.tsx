import CloseIcon from "@/icons/Close"
import { Story } from "@/models"
import { getTitleFtomStatus } from "@/utils"
import "./StoryDetails.sass"

interface Props {
  story: Story
  onClose: () => void
}

const StoryDetails = ({ story, onClose }: Props) => (
  <div className="story__wrapper">
    <div className="story">
      <CloseIcon onClick={onClose} />
      <div className="story__detail">
        <h1 className="story__title">
          {story.id} | {story.title}
        </h1>
        <hr />
        <h2 className="story__subtitle">Acceptance Criteria</h2>
        <p className="story__description">{story.description}</p>
      </div>
      <div className="story__sidebar">
        <div className="story__status">
          {/* <span>Status:</span> */}
          <div className="tag">{getTitleFtomStatus(story.status)}</div>
        </div>
        <div className="story__assignee">
          <span className="story__assignee__label">Assignee:</span>
          <div className="story__assignee__details">
            <div
              className="story__assignee__avatar"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1615109398623-88346a601842?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80")`,
              }}
            ></div>
            <div className="story__assignee__username">{story.assignee}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default StoryDetails
