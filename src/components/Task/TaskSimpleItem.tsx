import React from "react";
import { Task, TaskStatus } from "../../models/Task";
import "./TaskItem.css";

interface TaskSimpleItemProps {
  task: Task;
}

const getStatusBadgeClass = (status: TaskStatus): string => {
  switch (status) {
    case "todo":
      return "badge bg-secondary";
    case "in-progress":
      return "badge bg-primary";
    case "done":
      return "badge bg-success";
    default:
      return "badge bg-secondary";
  }
};

const TaskSimpleItem: React.FC<TaskSimpleItemProps> = ({ task }) => {
  return (
    <div className="task-item">
      <div className="task-header">
        <div className="task-title-section">
          <span className="task-title">{task.title}</span>
          <span className={getStatusBadgeClass(task.status)}>
            {task.status}
          </span>
        </div>
      </div>
      {task.description && (
        <div className="task-description">{task.description}</div>
      )}
    </div>
  );
};

export default TaskSimpleItem;
