import React, { useState } from 'react';
import { Task, TaskStatus } from '../../models/Task';
import {
  FaChevronDown,
  FaChevronRight,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCommentDots,
} from 'react-icons/fa';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (parentId: string) => void;
  onSelectForComments: (taskId: string, taskTitle: string) => void;
  level?: number;
}

const getStatusBadgeClass = (status: TaskStatus): string => {
  switch (status) {
    case 'todo':
      return 'badge bg-secondary';
    case 'in-progress':
      return 'badge bg-primary';
    case 'done':
      return 'badge bg-success';
    default:
      return 'badge bg-secondary';
  }
};

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onDelete,
  onEdit,
  onAddSubtask,
  onSelectForComments,
  level = 0,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="task-item" style={{ marginLeft: `${level * 20}px` }}>
      <div className="task-header">
        <div className="task-title-section">
          {hasSubtasks && (
            <button
              className="btn btn-sm btn-link expand-btn"
              onClick={toggleExpand}
            >
              {expanded ? <FaChevronDown /> : <FaChevronRight />}
            </button>
          )}
          <span className="task-title">{task.title}</span>
          <span className={getStatusBadgeClass(task.status)}>
            {task.status}
          </span>

          {task.categoryName && (
            <div className="task-category">
              <span className="category-label">Category: </span>
              <span className="category-name">{task.categoryName}</span>
            </div>
          )}
          {task.endTime && (
            <div className="task-end-time">
              <span className="end-time-label">End Time: </span>
              <span className="end-time-value">
                {new Date(task.endTime).toUTCString().slice(0, -4)}
              </span>
            </div>
          )}
        </div>
        <div className="task-actions">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => onAddSubtask(task.id)}
            title="Add Subtask"
          >
            <FaPlus />
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => onEdit(task)}
            title="Edit Task"
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onDelete(task.id)}
            title="Delete Task"
          >
            <FaTrash />
          </button>
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => onSelectForComments(task.id, task.title)}
            title="View Comments"
          >
            <FaCommentDots />
          </button>
        </div>
      </div>

      {task.description && (
        <div className="task-description">{task.description}</div>
      )}

      {expanded && hasSubtasks && (
        <div className="subtasks-container">
          {task?.subtasks?.map(subtask => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddSubtask={onAddSubtask}
              onSelectForComments={onSelectForComments}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
