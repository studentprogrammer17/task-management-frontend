import React from 'react';
import TaskForm from '../TaskForm/TaskForm';
import { Task, CreateTaskDto } from '../../models/Task';
import './UniqueTask.css';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: CreateTaskDto) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  onClose,
  onUpdate,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Task</h3>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <TaskForm onSubmit={onUpdate} onCancel={onClose} initialTask={task} />
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
