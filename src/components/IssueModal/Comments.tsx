"use client"

import { useState } from "react"
import Markdown from "@/components/Markdown"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import { useNow } from "@/hooks/useNow"
import { formatDateTime, formatRelative } from "@/lib/format"
import type { Comment, Issue } from "@/models"
import { CURRENT_USER_ID, useStore } from "@/store"
import styles from "./IssueModal.module.sass"

const Composer = ({
  initial = "",
  autoFocus,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: string
  autoFocus?: boolean
  submitLabel: string
  onSubmit: (body: string) => void
  onCancel?: () => void
}) => {
  const [body, setBody] = useState(initial)
  const [focused, setFocused] = useState(!!autoFocus)
  const submit = () => {
    if (!body.trim()) return
    onSubmit(body.trim())
    setBody("")
  }
  const expanded = focused || body || onCancel

  return (
    <div className={styles.composer}>
      <textarea
        autoFocus={autoFocus}
        rows={expanded ? 3 : 1}
        value={body}
        placeholder="Add a comment…"
        aria-label="Comment"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={e => setBody(e.target.value)}
        onKeyDown={e => {
          // Enter saves, Shift+Enter adds a line (skipped while an IME is composing)
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            submit()
          }
          if (e.key === "Escape") {
            e.stopPropagation()
            if (onCancel) onCancel()
            else e.currentTarget.blur()
          }
        }}
      />
      {expanded && (
        <div className={styles.editorActions}>
          <Button variant="primary" size="sm" disabled={!body.trim()} onMouseDown={e => e.preventDefault()} onClick={submit}>
            {submitLabel}
          </Button>
          {onCancel && (
            <Button variant="subtle" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <span className={styles.editorHint}>Enter to save · Shift+Enter for a new line</span>
        </div>
      )}
    </div>
  )
}

const CommentItem = ({ issueId, comment }: { issueId: string; comment: Comment }) => {
  const author = useStore(s => s.users.find(u => u.id === comment.authorId))
  const editComment = useStore(s => s.editComment)
  const deleteComment = useStore(s => s.deleteComment)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const now = useNow()
  const mine = comment.authorId === CURRENT_USER_ID

  return (
    <li className={styles.comment}>
      <Avatar user={author} size={32} />
      <div className={styles.commentBody}>
        <div className={styles.commentMeta}>
          <strong>{author?.name ?? "Unknown"}</strong>
          <time title={formatDateTime(comment.createdAt)}>{formatRelative(comment.createdAt, now)}</time>
          {comment.editedAt && <span className={styles.muted}>(edited)</span>}
        </div>
        {editing ? (
          <Composer
            autoFocus
            initial={comment.body}
            submitLabel="Save"
            onSubmit={body => {
              editComment(issueId, comment.id, body)
              setEditing(false)
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <Markdown source={comment.body} className={styles.commentText} />
            {mine && (
              <div className={styles.commentActions}>
                {confirming ? (
                  <>
                    <span>Delete this comment?</span>
                    <button type="button" className={styles.danger} onClick={() => deleteComment(issueId, comment.id)}>
                      Delete
                    </button>
                    <button type="button" onClick={() => setConfirming(false)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => setEditing(true)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => setConfirming(true)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </li>
  )
}

const Comments = ({ issue }: { issue: Issue }) => {
  const me = useStore(s => s.users.find(u => u.id === CURRENT_USER_ID))
  const addComment = useStore(s => s.addComment)
  // Newest first, like Jira
  const comments = [...issue.comments].reverse()

  return (
    <div>
      <div className={styles.newComment}>
        <Avatar user={me} size={32} />
        <Composer submitLabel="Save" onSubmit={body => addComment(issue.id, body)} />
      </div>
      <ul className={styles.comments}>
        {comments.map(comment => (
          <CommentItem key={comment.id} issueId={issue.id} comment={comment} />
        ))}
      </ul>
    </div>
  )
}

export default Comments
