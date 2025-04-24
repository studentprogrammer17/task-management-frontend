import React from "react";
import { Task } from "../../models/Task";
import TaskSimpleItem from "../Task/TaskSimpleItem";

interface TaskListProps {
  tasks: Task[];
  hideActions?: boolean;
}

const CategoriesTasks: React.FC<TaskListProps> = ({ tasks }) => {
  if (!tasks.length) return <div>No tasks found for this category.</div>;

  return (
    <div className="tasks-container">
      {tasks.map((task) => (
        <TaskSimpleItem key={task.id} task={task} />
      ))}
    </div>
  );
};

export default CategoriesTasks;
