import React, { useState, useEffect } from 'react';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../models/Task';
import { TaskService } from '../../services/task.service';
import TaskItem from '../Task/TaskItem';
import TaskForm from '../TaskForm/TaskForm';
import CommentsPanel from '../CommentSection/CommentPanel';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { useNavigate } from 'react-router-dom';
import './TaskList.css';
import MapComponent from '../MapComponent/MapComponent';

interface TaskListProps {
  onCreateNewTask: () => void;
  onCloseForm: () => void;
  fetchMainTasks: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  onCreateNewTask,
  onCloseForm,
  fetchMainTasks,
}) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string | null>(
    null
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    taskId: string | null;
    taskTitle: string;
  }>({
    isOpen: false,
    taskId: null,
    taskTitle: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSelectTaskForComments = (taskId: string, taskTitle: string) => {
    setSelectedTaskId(taskId);
    setSelectedTaskTitle(taskTitle);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await TaskService.getAllTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again later.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: CreateTaskDto) => {
    try {
      await TaskService.createTask(taskData);
      await fetchTasks();
      setShowForm(false);
      onCloseForm();
      await fetchMainTasks();
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (taskData: UpdateTaskDto) => {
    if (!editingTask) return;

    try {
      await TaskService.updateTask(editingTask.id, taskData);
      await fetchTasks();
      setEditingTask(null);
      onCloseForm();
      await fetchMainTasks();
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirmation({
      isOpen: true,
      taskId: id,
      taskTitle: title,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.taskId) {
      try {
        await TaskService.deleteTask(deleteConfirmation.taskId);
        await fetchTasks();
        await fetchMainTasks();
      } catch (err) {
        setError('Failed to delete task. Please try again.');
        console.error('Error deleting task:', err);
      }
      setDeleteConfirmation({
        isOpen: false,
        taskId: null,
        taskTitle: '',
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      taskId: null,
      taskTitle: '',
    });
  };

  const handleAddSubtask = async (taskData: CreateTaskDto) => {
    if (!addingSubtaskFor) return;

    try {
      await TaskService.addSubtask(addingSubtaskFor, taskData);
      await fetchTasks();
      setAddingSubtaskFor(null);
    } catch (err) {
      setError('Failed to add subtask. Please try again.');
      console.error('Error adding subtask:', err);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowForm(false);
    setAddingSubtaskFor(null);
    onCreateNewTask();
  };

  const handleAddSubtaskClick = (parentId: string) => {
    setAddingSubtaskFor(parentId);
    setShowForm(false);
    setEditingTask(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(null);
    onCloseForm();
    setAddingSubtaskFor(null);
  };

  const handleTaskClick = (taskId: string, event: React.MouseEvent) => {
    if (
      (event.target as HTMLElement).closest('.action-buttons') ||
      (event.target as HTMLElement).closest('.btn')
    ) {
      return;
    }
    navigate(`/task/${taskId}`);
  };

  return (
    <div className="task-list-with-comments">
      <div className="task-list-container">
        <div className="task-list-header">
          <h2>Your Tasks</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setEditingTask(null);
              setAddingSubtaskFor(null);
              onCreateNewTask();
            }}
          >
            Create New Task
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
            <button
              type="button"
              className="btn-close float-end"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {showForm && (
          <TaskForm onSubmit={handleCreateTask} onCancel={handleFormCancel} />
        )}
        {editingTask && (
          <TaskForm
            onSubmit={handleUpdateTask}
            onCancel={handleFormCancel}
            initialTask={editingTask}
          />
        )}
        {addingSubtaskFor && (
          <TaskForm
            onSubmit={handleAddSubtask}
            onCancel={handleFormCancel}
            isSubtask={true}
            parentTaskId={addingSubtaskFor}
          />
        )}

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Create your first task to get started!</p>
          </div>
        ) : (
          <div className="tasks-container">
            {tasks.map(task => (
              <div
                key={task.id}
                className="task-item-wrapper"
                onClick={e => handleTaskClick(task.id, e)}
              >
                <TaskItem
                  task={task}
                  onDelete={id => handleDeleteClick(id, task.title)}
                  onEdit={handleEditClick}
                  onAddSubtask={handleAddSubtaskClick}
                  onSelectForComments={handleSelectTaskForComments}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTaskId && (
        <div className="comments-panel-wrapper">
          <CommentsPanel
            taskId={selectedTaskId}
            taskTitle={selectedTaskTitle}
            onClose={() => setSelectedTaskId(null)}
          />
        </div>
      )}

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirmation.taskTitle}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default TaskList;
