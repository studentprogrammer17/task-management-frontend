import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Task, CreateTaskDto } from '../../models/Task';
import { TaskService } from '../../services/task.service';
import EditTaskModal from './EditTaskModal';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import './UniqueTask.css';
import { CommentService } from '../../services/comment.service';
import { FaTrash } from 'react-icons/fa';

const UniqueTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [showCommentDeleteDialog, setShowCommentDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<
    { id: string; text: string; createdAt: string }[]
  >([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (id) {
          const taskData = await TaskService.getTaskById(id);
          setTask(taskData);
          setComments(taskData.comments || []);
        }
      } catch (err) {
        setError('Failed to fetch task details');
        console.error('Error fetching task:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleUpdateTask = async (taskData: CreateTaskDto) => {
    if (!task) return;
    try {
      const updatedTask = await TaskService.updateTask(task.id, taskData);
      setTask(updatedTask);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    try {
      await TaskService.deleteTask(task.id);
      if (task.parentId) {
        navigate(`/task/${task.parentId}`);
        setShowDeleteDialog(false);
      } else {
        navigate('/');
        setShowDeleteDialog(false);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleAddSubtask = async (subtaskData: CreateTaskDto) => {
    if (!task) return;
    try {
      const updatedTask = await TaskService.addSubtask(task.id, subtaskData);
      setTask(updatedTask);
      setShowSubtaskModal(false);
    } catch (err) {
      console.error('Error adding subtask:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    try {
      const comment = await CommentService.createComment({
        text: newComment,
        taskId: task.id,
      });
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await CommentService.deleteComment(commentId);
      setComments([...comments.filter(comment => comment.id !== commentId)]);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="unique-task-container">
        <div className="loading-spinner">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="unique-task-container">
        <div className="error-message">
          <p>{error || 'Task not found'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Return to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="unique-task-container">
      <div className="task-header-unique">
        <h1>{task.title}</h1>
        <div className="task-actions">
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowEditModal(true)}
          >
            Edit Task
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Task
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
          >
            Back to Tasks
          </button>
          {task.parentId && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/task/${task.parentId}`)}
            >
              Back to previous task
            </button>
          )}
        </div>
      </div>

      <div className="task-content">
        <div className="task-main-info">
          <div className="status-badge">
            Status:{' '}
            <span className={`status-${task.status}`}>{task.status}</span>
          </div>

          {task.endTime && (
            <div className="end-time">
              <span className="label">End Time:</span>
              <span className="value">
                {new Date(task.endTime).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          )}

          {task.categoryName && (
            <div className="category">
              <span className="label">Category:</span>
              <span className="value">{task.categoryName}</span>
            </div>
          )}

          {task.description && (
            <div className="description">
              <h3>Description</h3>
              <p>{task.description}</p>
            </div>
          )}

          {task.lat && task.lng && (
            <div className="location">
              <h3>Location</h3>
              <p>Latitude: {task.lat}</p>
              <p>Longitude: {task.lng}</p>
            </div>
          )}
        </div>

        <div className="subtasks-section">
          <div className="subtasks-header">
            <h3>Subtasks</h3>
            <button
              className="btn btn-primary"
              onClick={() => setShowSubtaskModal(true)}
            >
              Add Subtask
            </button>
          </div>
          {task.subtasks && task.subtasks.length > 0 ? (
            <div className="subtasks-grid">
              {task.subtasks.map((subtask, index) => (
                <div
                  key={index}
                  className="subtask-card"
                  onClick={() => navigate(`/task/${subtask.id}`)}
                >
                  <h4>{subtask.title}</h4>
                  <div className={`status-badge status-${subtask.status}`}>
                    {subtask.status}
                  </div>
                  {subtask.description && <p>{subtask.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-subtasks">No subtasks yet</p>
          )}
        </div>

        <div className="comments-section">
          <h3>Comments</h3>
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
            />
            <button type="submit" className="btn btn-primary">
              Add Comment
            </button>
          </form>
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-content">
                  <p className="comment-text">{comment.text}</p>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  className="btn btn-link delete-comment-btn"
                  onClick={() => {
                    setCommentToDelete(comment.id);
                    setShowCommentDeleteDialog(true);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateTask}
        />
      )}

      {showSubtaskModal && (
        <EditTaskModal
          task={{ id: '', title: '', status: 'todo' } as Task}
          onClose={() => setShowSubtaskModal(false)}
          onUpdate={handleAddSubtask}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteTask}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <ConfirmationDialog
        isOpen={showCommentDeleteDialog}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={() => {
          if (commentToDelete) {
            handleDeleteComment(commentToDelete);
            setShowCommentDeleteDialog(false);
            setCommentToDelete(null);
          }
        }}
        onCancel={() => {
          setShowCommentDeleteDialog(false);
          setCommentToDelete(null);
        }}
      />
    </div>
  );
};

export default UniqueTask;
