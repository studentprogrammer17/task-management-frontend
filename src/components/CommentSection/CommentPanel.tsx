import React, { useState, useEffect } from "react";
import { Comment } from "../../models/Comment";
import { CommentService } from "../../services/comment.service";
import "./CommentPanel.css";

interface CommentsPanelProps {
  taskId: string | null;
  taskTitle: string | null;
  onClose: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  taskId,
  taskTitle,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const fetched = await CommentService.getCommentsByTaskId(taskId!);
      setComments(fetched);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !taskId) return;

    try {
      await CommentService.createComment({ text: newComment, taskId });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await CommentService.deleteComment(commentId);
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleUpdateComment = async (commentId: string, text: string) => {
    try {
      await CommentService.updateComment(commentId, { text });
      fetchComments();
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  return (
    <div className="comments-panel">
      <div className="comments-header">
        <h3>Comments for {taskTitle}</h3>
        <button className="close-btn" onClick={onClose} title="Close">
          &times;
        </button>
      </div>

      {taskId ? (
        <>
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <textarea
                  value={comment.text}
                  onChange={(e) =>
                    handleUpdateComment(comment.id, e.target.value)
                  }
                />
                <button onClick={() => handleDeleteComment(comment.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className="add-comment">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleAddComment}>Add Comment</button>
          </div>
        </>
      ) : (
        <p>Select a task to view comments</p>
      )}
    </div>
  );
};

export default CommentsPanel;
